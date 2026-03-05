# ConectaFisio - Guia Completo de Deploy em Produção

**Versão:** 1.0  
**Data:** Janeiro 2024  
**Autor:** Manus AI

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Servidor](#preparação-do-servidor)
3. [Instalação de Dependências](#instalação-de-dependências)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Deploy da Aplicação](#deploy-da-aplicação)
6. [Configuração do Nginx](#configuração-do-nginx)
7. [SSL com Let's Encrypt](#ssl-com-lets-encrypt)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)
9. [Backup Automático](#backup-automático)
10. [Monitoramento e Logs](#monitoramento-e-logs)
11. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

Antes de iniciar o deploy, certifique-se de que você possui:

- **VPS Linux** com Ubuntu 22.04 LTS (recomendado)
- **Acesso SSH** com privilégios de sudo
- **Domínio** registrado e apontando para o IP do servidor
- **Certificado SSL** (será gerado automaticamente com Let's Encrypt)
- **Conhecimento básico** de Linux e gerenciamento de servidores

### Requisitos de Hardware

| Componente | Mínimo | Recomendado |
|-----------|--------|------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 8 GB |
| Armazenamento | 20 GB | 100 GB |
| Largura de banda | 1 Mbps | 10 Mbps |

---

## Preparação do Servidor

### 1. Conectar ao Servidor

```bash
ssh root@seu_ip_do_servidor
```

### 2. Atualizar o Sistema

```bash
apt update && apt upgrade -y
apt install -y curl wget git build-essential
```

### 3. Criar Usuário de Aplicação

```bash
useradd -m -s /bin/bash conectafisio
usermod -aG sudo conectafisio
su - conectafisio
```

### 4. Clonar o Repositório

```bash
cd ~
git clone https://seu_repositorio.git conecta_fisio
cd conecta_fisio
```

---

## Instalação de Dependências

### 1. Instalar Node.js e npm

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar instalação
npm --version
```

### 2. Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

### 3. Instalar MySQL 8.0

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

**Respostas recomendadas:**
- Remove anonymous users? **Y**
- Disable remote root login? **Y**
- Remove test database? **Y**
- Reload privilege tables now? **Y**

### 4. Instalar Python 3.11 (para Microserviço IA)

```bash
sudo apt install -y python3.11 python3.11-venv python3-pip
python3.11 --version
```

### 5. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## Configuração do Banco de Dados

### 1. Criar Banco de Dados

```bash
sudo mysql -u root -p

# Dentro do MySQL:
CREATE DATABASE conecta_fisio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'conectafisio'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON conecta_fisio.* TO 'conectafisio'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Executar Migrações

```bash
cd ~/conecta_fisio
pnpm db:push
```

---

## Deploy da Aplicação

### 1. Instalar Dependências do Projeto

```bash
cd ~/conecta_fisio
pnpm install
```

### 2. Build da Aplicação

```bash
pnpm build
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env  # Editar com suas configurações
```

Veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente) para detalhes.

### 4. Criar Serviço Systemd

```bash
sudo nano /etc/systemd/system/conecta-fisio.service
```

Adicione o seguinte conteúdo:

```ini
[Unit]
Description=ConectaFisio Application
After=network.target mysql.service

[Service]
Type=simple
User=conectafisio
WorkingDirectory=/home/conectafisio/conecta_fisio
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/conecta-fisio/app.log
StandardError=append:/var/log/conecta-fisio/error.log

[Install]
WantedBy=multi-user.target
```

### 5. Criar Diretório de Logs

```bash
sudo mkdir -p /var/log/conecta-fisio
sudo chown conectafisio:conectafisio /var/log/conecta-fisio
```

### 6. Iniciar o Serviço

```bash
sudo systemctl daemon-reload
sudo systemctl enable conecta-fisio
sudo systemctl start conecta-fisio
sudo systemctl status conecta-fisio
```

### 7. Microserviço IA (Python)

```bash
cd ~/conecta_fisio/ai_service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Criar serviço Systemd para IA:

```bash
sudo nano /etc/systemd/system/conecta-fisio-ai.service
```

```ini
[Unit]
Description=ConectaFisio AI Service
After=network.target

[Service]
Type=simple
User=conectafisio
WorkingDirectory=/home/conectafisio/conecta_fisio/ai_service
Environment="PATH=/home/conectafisio/conecta_fisio/ai_service/venv/bin"
ExecStart=/home/conectafisio/conecta_fisio/ai_service/venv/bin/python main.py
Restart=always
RestartSec=10
StandardOutput=append:/var/log/conecta-fisio/ai.log
StandardError=append:/var/log/conecta-fisio/ai-error.log

[Install]
WantedBy=multi-user.target
```

Iniciar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable conecta-fisio-ai
sudo systemctl start conecta-fisio-ai
```

---

## Configuração do Nginx

### 1. Criar Arquivo de Configuração

```bash
sudo nano /etc/nginx/sites-available/conecta-fisio
```

Adicione:

```nginx
upstream conecta_fisio_backend {
    server localhost:3000;
}

upstream conecta_fisio_ai {
    server localhost:8000;
}

server {
    listen 80;
    server_name seu_dominio.com www.seu_dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu_dominio.com www.seu_dominio.com;

    # SSL (será configurado com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu_dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu_dominio.com/privkey.pem;

    # Configurações SSL Recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/conecta-fisio-access.log;
    error_log /var/log/nginx/conecta-fisio-error.log;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # Proxy para Backend Principal
    location / {
        proxy_pass http://conecta_fisio_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy para Microserviço IA
    location /api/ai/ {
        rewrite ^/api/ai/(.*)$ /$1 break;
        proxy_pass http://conecta_fisio_ai;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
    gzip_min_length 1000;
}
```

### 2. Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/conecta-fisio /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

---

## SSL com Let's Encrypt

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Gerar Certificado

```bash
sudo certbot certonly --nginx -d seu_dominio.com -d www.seu_dominio.com
```

### 3. Renovação Automática

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

Verificar status:

```bash
sudo systemctl status certbot.timer
```

---

## Variáveis de Ambiente

### Criar Arquivo .env

```bash
nano ~/.env
```

### Variáveis Obrigatórias

```env
# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=mysql://conectafisio:senha_segura@localhost:3306/conecta_fisio

# JWT
JWT_SECRET=sua_chave_jwt_super_segura_aqui

# OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=seu_app_id
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner
OWNER_NAME=Admin
OWNER_OPEN_ID=seu_open_id

# APIs Internas
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api

# IA Service
IA_SERVICE_URL=http://localhost:8000

# Google Maps
GOOGLE_MAPS_API_KEY=sua_chave_google_maps

# Email (SendGrid, AWS SES, etc)
SENDGRID_API_KEY=sua_chave_sendgrid
SENDGRID_FROM_EMAIL=noreply@seu_dominio.com

# WhatsApp (Twilio, Zenvia, etc)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+55xxxxxxxxxxxx

# Backup
BACKUP_PATH=/backups/conecta-fisio
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/conecta-fisio/app.log
```

---

## Backup Automático

### 1. Criar Script de Backup

```bash
sudo nano /usr/local/bin/backup-conecta-fisio.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/backups/conecta-fisio"
DB_USER="conectafisio"
DB_PASS="senha_segura"
DB_NAME="conecta_fisio"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos arquivos da aplicação
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/conectafisio/conecta_fisio

# Remover backups antigos
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log
echo "Backup concluído em $(date)" >> /var/log/conecta-fisio/backup.log
```

### 2. Tornar Executável

```bash
sudo chmod +x /usr/local/bin/backup-conecta-fisio.sh
```

### 3. Agendar com Cron

```bash
sudo crontab -e
```

Adicione:

```cron
# Backup diário às 2 da manhã
0 2 * * * /usr/local/bin/backup-conecta-fisio.sh
```

---

## Monitoramento e Logs

### 1. Ver Logs da Aplicação

```bash
sudo tail -f /var/log/conecta-fisio/app.log
sudo tail -f /var/log/conecta-fisio/error.log
sudo tail -f /var/log/conecta-fisio/ai.log
```

### 2. Monitorar Serviços

```bash
# Status de todos os serviços
sudo systemctl status conecta-fisio
sudo systemctl status conecta-fisio-ai
sudo systemctl status nginx
sudo systemctl status mysql

# Reiniciar serviços
sudo systemctl restart conecta-fisio
sudo systemctl restart conecta-fisio-ai
```

### 3. Monitorar Recursos

```bash
# CPU e Memória
top

# Espaço em disco
df -h

# Conexões de rede
netstat -tlnp | grep LISTEN
```

---

## Troubleshooting

### Problema: Aplicação não inicia

**Solução:**

```bash
sudo systemctl status conecta-fisio
sudo journalctl -u conecta-fisio -n 50
sudo tail -f /var/log/conecta-fisio/error.log
```

### Problema: Banco de dados não conecta

**Solução:**

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u conectafisio -p -h localhost conecta_fisio

# Verificar permissões
sudo mysql -u root -p
SHOW GRANTS FOR 'conectafisio'@'localhost';
```

### Problema: Certificado SSL expirado

**Solução:**

```bash
sudo certbot renew --dry-run
sudo certbot renew
sudo systemctl reload nginx
```

### Problema: Nginx retorna 502 Bad Gateway

**Solução:**

```bash
# Verificar se backend está rodando
sudo systemctl status conecta-fisio

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/conecta-fisio-error.log

# Testar conectividade
curl http://localhost:3000
```

### Problema: Microserviço IA não responde

**Solução:**

```bash
# Verificar status
sudo systemctl status conecta-fisio-ai

# Testar endpoint
curl http://localhost:8000/health

# Ver logs
sudo tail -f /var/log/conecta-fisio/ai-error.log
```

---

## Checklist de Deploy

- [ ] VPS provisionado com Ubuntu 22.04 LTS
- [ ] Domínio registrado e apontando para IP do servidor
- [ ] Node.js 22.x instalado
- [ ] MySQL 8.0 instalado e banco criado
- [ ] Python 3.11 instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (pnpm install)
- [ ] Build realizado (pnpm build)
- [ ] Variáveis de ambiente configuradas
- [ ] Serviço Node.js criado e iniciado
- [ ] Serviço IA criado e iniciado
- [ ] Nginx configurado
- [ ] SSL com Let's Encrypt ativado
- [ ] Backup automático configurado
- [ ] Monitoramento e logs verificados
- [ ] Testes de funcionalidade realizados

---

## Suporte e Manutenção

Para suporte técnico e atualizações, consulte a documentação oficial em [https://conectafisio.com/docs](https://conectafisio.com/docs).

**Última atualização:** Janeiro 2024

#!/usr/bin/env node

/**
 * Script para cadastrar administradores no banco de dados
 * Suporta MySQL local e TiDB Cloud com SSL
 * Uso: node scripts/seed-admins.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const ADMINS = [
  {
    openId: 'admin-lu-souza-1988',
    name: 'Lu Souza',
    email: 'lu.souza.1988@gmail.com',
    loginMethod: 'manual',
    role: 'admin',
  },
  {
    openId: 'admin-felipe-alves-soft',
    name: 'Felipe Alves',
    email: 'felipealves.soft@gmail.com',
    loginMethod: 'manual',
    role: 'admin',
  },
];

async function seedAdmins() {
  let connection;

  try {
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root@localhost/conecta_fisio');
    
    const connectionConfig = {
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    // Adicionar SSL se for TiDB Cloud
    if (dbUrl.hostname.includes('tidbcloud')) {
      connectionConfig.ssl = {
        rejectUnauthorized: false,
      };
      console.log('🔒 Usando conexão SSL para TiDB Cloud');
    }

    connection = await mysql.createConnection(connectionConfig);

    console.log('✓ Conectado ao banco de dados');

    for (const admin of ADMINS) {
      try {
        // Verificar se já existe
        const [existing] = await connection.execute(
          'SELECT id FROM users WHERE openId = ?',
          [admin.openId]
        );

        if (existing.length > 0) {
          console.log(`⚠ Admin ${admin.email} já existe`);
          continue;
        }

        // Inserir novo admin
        await connection.execute(
          `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [admin.openId, admin.name, admin.email, admin.loginMethod, admin.role]
        );

        console.log(`✓ Admin ${admin.email} cadastrado com sucesso`);
      } catch (error) {
        console.error(`✗ Erro ao cadastrar ${admin.email}:`, error.message);
      }
    }

    console.log('\n✓ Seed de administradores concluído!');
    console.log('\nAdministradores cadastrados:');
    ADMINS.forEach((admin) => {
      console.log(`  - ${admin.email} (${admin.name})`);
    });

  } catch (error) {
    console.error('✗ Erro de conexão:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedAdmins();

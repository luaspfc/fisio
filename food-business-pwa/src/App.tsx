import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Chat } from './pages/Chat'
import { Photo } from './pages/Photo'
import { Sales } from './pages/Sales'
import { Summary } from './pages/Summary'
import { Recipes } from './pages/Recipes'
import { IFood } from './pages/IFood'
import { Settings } from './pages/Settings'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conversar" element={<Chat />} />
        <Route path="/foto" element={<Photo />} />
        <Route path="/vendas" element={<Sales />} />
        <Route path="/resumo" element={<Summary />} />
        <Route path="/receitas" element={<Recipes />} />
        <Route path="/ifood" element={<IFood />} />
        <Route path="/configuracoes" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

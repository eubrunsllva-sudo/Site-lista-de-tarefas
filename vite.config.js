import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ajuste o 'base' para o nome do seu repositório exatamente como está no GitHub
  // Exemplo: se o link é github.com/seu-user/meu-site, coloque '/meu-site/'
  base: './', 
})
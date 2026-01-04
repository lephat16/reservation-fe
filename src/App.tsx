import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import { AdminRoute, ProtectedRoute } from './services/Security'
import ProductPage from './pages/product/ProductPage'
import AllProductPage from './pages/product/AllProductsPage'
import SupplierPage from './pages/supplier/SupplierPage'
import TransactionPage from './pages/transaction/TransactionPage'
import ProfilePage from './pages/profile/ProfilePage'
import DashboardPage from './pages/dashboard/DashboardPage'
import PurchasePage2 from './pages/purchase/PurchasePage2'
import SellPage2 from './pages/sell/SellPage2'
import { ColorModeContext, useMode } from './theme'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import MainLayout from './layout/Layout'
import CategoriesPage from './pages/category/CatagoriesPage'
import CategoryDetailPage from './pages/category/CategoryDetailPage'

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path='/register' element={<RegisterPage />}></Route>
            <Route path='/login' element={<LoginPage />}></Route>

            <Route element={<MainLayout />}>
              <Route path='/category' element={<AdminRoute element={<CategoriesPage />} />}></Route>
              <Route path='/category/:categoryId' element={<AdminRoute element={<CategoryDetailPage />} />}/>
              <Route path="/product/:productId" element={<AdminRoute element={<ProductPage />} />} />
              <Route path="/products/:productId" element={<AdminRoute element={<ProductPage />} />} />
              <Route path="/products" element={<AdminRoute element={<AllProductPage />} />} />
              <Route path="/supplier" element={<AdminRoute element={<SupplierPage />} />} />

              <Route path="/purchase" element={<ProtectedRoute element={<PurchasePage2 />} />} />
              <Route path="/sell" element={<ProtectedRoute element={<SellPage2 />} />} />
              <Route path="/transaction" element={<ProtectedRoute element={<TransactionPage />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import { AdminRoute, ProtectedRoute } from './services/Security'
import ProductPage from './pages/product/ProductPage'
import ProfilePage from './pages/profile/ProfilePage'
import { ColorModeContext, useMode } from './theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import MainLayout from './layout/Layout'
import CategoriesPage from './pages/category/CategoriesPage'
import CategoryDetailPage from './pages/category/CategoryDetailPage'
import AllSupplierPage from './pages/supplier/AllSupplierPage'
import SupplierPage from './pages/supplier/SupplierPage'
import PurchaseOrderPage from './pages/purchase/PurchaseOrderPage'
import PurchaseOrderDetailPage from './pages/purchase/PurchaseOrderDetailPage'
import ReceiveForm from './components/forms/ReceiveForm'
import CreatePurchasePage from './pages/purchase/CreatePurchasePage'
import SellOrderPage from './pages/sell/SellOrderPage'
import SellOrderDetailPage from './pages/sell/SellOrderDetailPage'
import DeliverForm from './components/forms/DeliverForm'
import CreateSellPage from './pages/sell/CreateSellPage'
import StockHistoriesPage from './pages/stocks/StockHistoriesPage'
import WarehousePage from './pages/stocks/WarehousePage'
import AllProductsPageRefator from './pages/product/AllProductsPageRefator'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path='/register' element={<RegisterPage />}></Route>
              <Route path='/login' element={<LoginPage />}></Route>

              <Route element={<MainLayout />}>
                <Route path='/category' element={<AdminRoute element={<CategoriesPage />} />}></Route>
                <Route path='/category/:categoryId' element={<AdminRoute element={<CategoryDetailPage />} />} />
                <Route path="/products/:productId" element={<AdminRoute element={<ProductPage />} />} />
                <Route path="/products" element={<AdminRoute element={<AllProductsPageRefator />} />} />
                <Route path="/suppliers" element={<AdminRoute element={<AllSupplierPage />} />} />
                <Route path="/suppliers/:supplierId" element={<AdminRoute element={<SupplierPage />} />} />

                <Route path="/purchase-order" element={<ProtectedRoute element={<PurchaseOrderPage />} />} />
                <Route path="/purchase-order/:poId/receive" element={<ProtectedRoute element={<ReceiveForm />} />} />
                <Route path="/purchase-order/:poId" element={<ProtectedRoute element={<PurchaseOrderDetailPage />} />} />
                <Route path="/purchase-order/create" element={<ProtectedRoute element={<CreatePurchasePage />} />} />

                <Route path="/sell-order" element={<ProtectedRoute element={<SellOrderPage />} />} />
                <Route path="/sell-order/:soId/deliver" element={<ProtectedRoute element={<DeliverForm />} />} />
                <Route path="/sell-order/:soId" element={<ProtectedRoute element={<SellOrderDetailPage />} />} />
                <Route path="/sell-order/create" element={<ProtectedRoute element={<CreateSellPage />} />} />

                <Route path="/stocks/history" element={<ProtectedRoute element={<StockHistoriesPage />} />} />
                <Route path="/warehouses" element={<ProtectedRoute element={<WarehousePage />} />} />

                <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
                {/* <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} /> */}
              </Route>
            </Routes>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App

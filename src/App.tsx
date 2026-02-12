import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import RegisterPage from './features/auth/components/RegisterPage'
import LoginPage from './features/auth/components/LoginPage'
import { ProtectedRoute } from './shared/Security'
import ProductPage from './features/products/components/ProductPage'
import ProfilePage from './features/auth/ProfilePage'
import { ColorModeContext, useMode } from './shared/theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import MainLayout from './pages/Layout'
import CategoriesPage from './features/categories/CategoriesPage'
import CategoryDetailPage from './features/categories/components/CategoryDetailPage'
import AllSupplierPage from './features/suppliers/AllSupplierPage'
import SupplierPage from './features/suppliers/components/SupplierPage'
import PurchaseOrderPage from './features/purchases/PurchaseOrderPage'
import PurchaseOrderDetailPage from './features/purchases/components/PurchaseOrderDetailPage'
import ReceiveForm from './features/purchases/components/ReceiveForm'
import CreatePurchasePage from './features/purchases/components/CreatePurchasePage'
import SellOrderPage from './features/sales/SellOrderPage'
import SellOrderDetailPage from './features/sales/components/SellOrderDetailPage'
import DeliverForm from './features/sales/components/DeliverForm'
import CreateSellPage from './features/sales/components/CreateSellPage'
import WarehousePage from './features/stocks/WarehousePage'
import AllProductsPageRefator from './features/products/AllProductsPageRefator'
import ErrorBoundary from './shared/components/global/ErrorBoundary'
import { ScreenProvider } from './shared/hooks/ScreenContext'
import StockMovementHistoryPage from './features/stocks/components/StockMovementHistoryPage'
import { useDispatch } from "react-redux";
import { useEffect, useState } from 'react'
import { refreshAccessToken } from './api/axiosClient'
import {  setToken, setUser } from './features/auth/store/authSlice'
import { authAPI } from './features/auth/api/authAPI'

function App() {

  const [theme, colorMode] = useMode();
  const dispatch = useDispatch();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = await refreshAccessToken();
      if (token) {
        dispatch(setToken(token));
        try {
          const profile = await authAPI.getLoggedInUser();
          dispatch(setUser(profile.data));
        } catch (err) {
          console.error("Load profile failed", err);
        }
      }
      setLoadingAuth(false);
    };
    initializeAuth();
  }, [dispatch]);

  if (loadingAuth) return <div>Loading...</div>;
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <ScreenProvider>
            {/* <UserProvider> */}
            <Router>
              <Routes>
                <Route path='/register' element={<RegisterPage />}></Route>
                <Route path='/login' element={<LoginPage />}></Route>
                <Route element={<MainLayout />}>
                  <Route path="/category" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<CategoriesPage />} />} />
                  <Route path='/category/:categoryId' element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<CategoryDetailPage />} />} />
                  <Route path="/products/:productId" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<ProductPage />} />} />
                  <Route path="/products" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<AllProductsPageRefator />} />} />
                  <Route path="/suppliers" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<AllSupplierPage />} />} />
                  <Route path="/suppliers/:supplierId" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<SupplierPage />} />} />

                  <Route path="/purchase-order" element={<ProtectedRoute element={<PurchaseOrderPage />} />} />
                  <Route path="/purchase-order/:poId/receive" element={<ProtectedRoute element={<ReceiveForm />} />} />
                  <Route path="/purchase-order/:poId" element={<ProtectedRoute element={<PurchaseOrderDetailPage />} />} />
                  <Route path="/purchase-order/create" element={<ProtectedRoute element={<CreatePurchasePage />} />} />

                  <Route path="/sell-order" element={<ProtectedRoute element={<SellOrderPage />} />} />
                  <Route path="/sell-order/:soId/deliver" element={<ProtectedRoute element={<DeliverForm />} />} />
                  <Route path="/sell-order/:soId" element={<ProtectedRoute element={<SellOrderDetailPage />} />} />
                  <Route path="/sell-order/create" element={<ProtectedRoute element={<CreateSellPage />} />} />

                  <Route path="/stocks/history" element={<ProtectedRoute element={<StockMovementHistoryPage />} />} />
                  <Route path="/warehouses" element={<ProtectedRoute element={<WarehousePage />} />} />

                  <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
                  {/* <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} /> */}
                </Route>
              </Routes>
            </Router>
            {/* </UserProvider> */}
          </ScreenProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './features/auth/components/LoginPage'
import { ProtectedRoute } from './shared/security/ProtectedRoute'
import ProductPage from './features/products/components/ProductPage'
import ProfilePage from './features/auth/ProfilePage'
import { ColorModeContext, useMode } from './shared/theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import MainLayout from './shared/components/layout/Layout'
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
import AllProductsPage from './features/products/AllProductsPage'
import ErrorBoundary from './shared/components/global/ErrorBoundary'
import { ScreenProvider } from './shared/hooks/ScreenContext'
import StockMovementHistoryPage from './features/stocks/components/StockMovementHistoryPage'
import { useDispatch } from "react-redux";
import { useEffect, useState } from 'react'
import { userAPI } from './features/user/api/userAPI'
import { setUser } from './features/auth/store/authSlice'
import { PublicRoute } from './shared/security/PublicRoute'
import NotFoundPage from './shared/components/notfoundpage/NotFoundPage'
import UsersPage from './features/user/UsersPage'
import CreatePasswordPage from './features/user/compoments/CreatePassword'

function App() {

  const [theme, colorMode] = useMode();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await userAPI.getLoggedInUser();
        dispatch(setUser(res.data));
      } catch {
        dispatch(setUser(null));
      } finally {
        setChecked(true);
      }
    };

    restoreUser();
  }, []);

  if (!checked) return <div>Loading...</div>;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <ScreenProvider>
            <Router>
              <Routes>
                {/* 登録ページは現在使用しないため、コメントアウトしています */}
                {/* <Route path='/register' element={<PublicRoute element={<RegisterPage />} />} /> */}
                <Route path='/login' element={<PublicRoute element={<LoginPage />} />} />
                <Route element={<MainLayout />}>
                  <Route path="/category" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<CategoriesPage />} />} />
                  <Route path='/category/:categoryId' element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<CategoryDetailPage />} />} />
                  <Route path="/products/:productId" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<ProductPage />} />} />
                  <Route path="/products" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<AllProductsPage />} />} />
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
                  <Route path="/users" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<UsersPage />} />} />
                </Route>
                <Route path="/create-password" element={<PublicRoute element={<CreatePasswordPage />} />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </ScreenProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App

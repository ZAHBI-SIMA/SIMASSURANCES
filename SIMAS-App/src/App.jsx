import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import AboutPage from './pages/Public/AboutPage'
import ContactPage from './pages/Public/ContactPage'
import MainLayout from './layouts/MainLayout'
import PublicLayout from './layouts/PublicLayout'
import OffersPage from './pages/Public/OffersPage'

import PartnerLayout from './layouts/PartnerLayout'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/Clients/ClientList'
import ClientDetail from './pages/Clients/ClientDetail'
import ProspectList from './pages/Clients/ProspectList'
import ProspectDetail from './pages/Clients/ProspectDetail'
import PartnerList from './pages/Partners/PartnerList'
import PartnerDetail from './pages/Partners/PartnerDetail'
import PartnerPortal from './pages/Partners/Portal/PartnerPortal'
import PortalMissions from './pages/Partners/Portal/PortalMissions'
import PortalInvoices from './pages/Partners/Portal/PortalInvoices'
import PortalPayments from './pages/Partners/Portal/PortalPayments'
import PortalProducts from './pages/Partners/Portal/PortalProducts'
import PortalQuotes from './pages/Partners/Portal/PortalQuotes'
import PortalQuoteCreate from './pages/Partners/Portal/PortalQuoteCreate'
import ContractList from './pages/Contracts/ContractList'
import ContractDetail from './pages/Contracts/ContractDetail'
import ClaimList from './pages/Claims/ClaimList'
import ClaimDetail from './pages/Claims/ClaimDetail'
import ProductList from './pages/Products/ProductList'
import ProductDetail from './pages/Products/ProductDetail'
import FinancePage from './pages/Finance/FinancePage'
import LandingPage from './pages/Public/LandingPage'
import ClientRegister from './pages/Auth/ClientRegister'
import ClientLayout from './layouts/ClientLayout'
import ClientDashboard from './pages/Client/ClientDashboard'
import SubscriptionPage from './pages/Client/SubscriptionPage'
import ClientContracts from './pages/Client/ClientContracts'
import ClientClaims from './pages/Client/ClientClaims'
import ClientClaimCreate from './pages/Client/ClientClaimCreate'


// Auth Wrapper to protect routes
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes with Layout */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/offres" element={<OffersPage />} />
                    <Route path="/a-propos" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<ClientRegister />} />

                {/* Admin Routes - Moved to /admin */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />

                    {/* Client Routes */}
                    <Route path="clients" element={<ClientList />} />
                    <Route path="clients/:id" element={<ClientDetail />} />

                    {/* Prospect Routes */}
                    <Route path="prospects" element={<ProspectList />} />
                    <Route path="prospects/:id" element={<ProspectDetail />} />

                    {/* Partner Routes */}
                    <Route path="partners" element={<PartnerList />} />
                    <Route path="partners/:id" element={<PartnerDetail />} />

                    {/* Contract Routes */}
                    <Route path="contracts" element={<ContractList />} />
                    <Route path="contracts/:id" element={<ContractDetail />} />

                    {/* Claim Routes */}
                    <Route path="claims" element={<ClaimList />} />
                    <Route path="claims/:id" element={<ClaimDetail />} />

                    {/* Product Routes */}
                    <Route path="products" element={<ProductList />} />
                    <Route path="products/:id" element={<ProductDetail />} />

                    {/* Finance Routes */}
                    <Route path="finance" element={<FinancePage />} />
                </Route>

                {/* Distributor Space */}
                <Route path="/distributor" element={
                    <ProtectedRoute allowedRoles={['partner']}>
                        <PartnerLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<PartnerPortal />} />
                    <Route path="products" element={<PortalProducts />} />
                    <Route path="quotes" element={<PortalQuotes />} />
                    <Route path="quotes/new" element={<PortalQuoteCreate />} />
                    <Route path="contracts" element={<ContractList />} />
                    <Route path="commissions" element={<PortalPayments />} />
                </Route>

                {/* Provider Space */}
                <Route path="/provider" element={
                    <ProtectedRoute allowedRoles={['partner']}>
                        <PartnerLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<PartnerPortal />} />
                    <Route path="missions" element={<PortalMissions />} />
                    <Route path="invoices" element={<PortalInvoices />} />
                    <Route path="payments" element={<PortalPayments />} />
                </Route>

                {/* Client Portal Routes */}
                <Route path="/client" element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <ClientLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<ClientDashboard />} />
                    <Route path="contracts" element={<ClientContracts />} />
                    <Route path="claims" element={<ClientClaims />} />
                    <Route path="claims/new" element={<ClientClaimCreate />} />
                    <Route path="subscription/:productId" element={<SubscriptionPage />} />
                    {/* Add other client routes here later */}
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App

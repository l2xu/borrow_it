import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserChatOverview from "./screens/user/UserChatOverview";
import UserLogin from "./screens/user/UserLogin";
import UserBrowseItems from "./screens/user/UserBrowseItems";
import UserProfile from "./screens/user/UserProfile";
import UserOwnItems from "./screens/user/UserOwnItems";
import UserAddItem from "./screens/user/UserAddItem";
import UserChat from "./screens/user/UserChat";
import ProtectedRoute from "./components/ProtectedRoute";
import WithNavLayout from "./layouts/WithNavLayout";
import UserEditProfile from "./screens/user/UserEditProfile";
import AdminLogin from "./screens/admin/AdminLogin";
import AdminDashboard from "./screens/admin/AdminDashboard";
import AdminAddUser from "./screens/admin/AdminAddUser";
import AdminEditUser from "./screens/admin/AdminEditUser";
import UserItem from "./screens/user/UserItem";
import UserEditItem from "./screens/user/UserEditItem";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// App component that contains all the routes for the application and wraps the entire app with the Auth and Toast context providers
function App() {
	return (
		<ToastProvider>
			<AuthProvider>
				<Router>
					<Routes>
						<Route path="/login" element={<UserLogin />} />
						<Route path="/admin/login" element={<AdminLogin />} />
						<Route
							path="/admin/dashboard"
							element={<ProtectedRoute element={<AdminDashboard />} />}
						/>
						<Route
							path="/admin/dashboard/add"
							element={<ProtectedRoute element={<AdminAddUser />} />}
						/>
						<Route
							path="/admin/dashboard/edit/:user_id"
							element={<ProtectedRoute element={<AdminEditUser />} />}
						/>
						<Route element={<WithNavLayout />}>
							<Route
								path="/"
								element={<ProtectedRoute element={<UserBrowseItems />} />}
							/>
							<Route
								path="/item/:item_id"
								element={<ProtectedRoute element={<UserItem />} />}
							/>
							<Route
								path="/chat"
								element={<ProtectedRoute element={<UserChatOverview />} />}
							/>
							<Route
								path="/chat/:chat_id"
								element={<ProtectedRoute element={<UserChat />} />}
							/>
							<Route
								path="/add"
								element={<ProtectedRoute element={<UserAddItem />} />}
							/>
							<Route
								path="/user-items"
								element={<ProtectedRoute element={<UserOwnItems />} />}
							/>
							<Route
								path="/user-items/:item_id"
								element={<ProtectedRoute element={<UserEditItem />} />}
							/>
							<Route
								path="/profile"
								element={<ProtectedRoute element={<UserProfile />} />}
							/>
							<Route
								path="/profile/edit"
								element={<ProtectedRoute element={<UserEditProfile />} />}
							/>
						</Route>
					</Routes>
				</Router>
			</AuthProvider>
		</ToastProvider>
	);
}

export default App;

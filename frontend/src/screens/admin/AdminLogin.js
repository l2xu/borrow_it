import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// The AdminLogin component is used to display the admin login page.
// It checks if an admin exists and displays the login form if an admin exists.
const AdminLogin = () => {
	const { login } = useAuth();
	const showToast = useToast();
	const [adminExists, setAdminExists] = useState(false);
	useEffect(() => {
		checkAdmin();
	}, []);

	const navigate = useNavigate();

	// The checkAdmin function is used to check if an admin exists.
	const checkAdmin = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/admin`
			);

			if (response.data.success === true) {
				setAdminExists(true);
			} else {
				setAdminExists(false);
			}
		} catch (error) {
			showToast(error.response.data.message, "signal");
		}
	};

	// The handleLogin function is used to make a POST request to login an admin.
	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/admin/login`,
				{
					email: e.target.email.value,
					password: e.target.password.value,
				}
			);

			const token = response.data.data;
			login(token);
			showToast(response.data.message);
			navigate("/admin/dashboard");
		} catch (error) {
			showToast(error.response.data.message, "signal");
		}
	};

	// The handleRegister function is used to make a POST request to register an admin.
	const handleRegister = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/admin/register`,
				{
					firstname: e.target.firstname.value,
					lastname: e.target.lastname.value,
					email: e.target.email.value,
					password: e.target.password.value,
				}
			);

			showToast(response.data.message);
			await handleLogin(e);
		} catch (error) {
			showToast(error.response.data.message, "signal");
		}
	};

	return (
		<>
			{adminExists ? (
				// The login form is displayed if an admin exists.
				<div className="flex flex-col justify-between py-10 px-8 gap-36 text-center ">
					<div>
						<h1 className="font-ubuntu text-4xl  mb-2">Admin Login</h1>
					</div>
					<form className="flex flex-col gap-2" onSubmit={handleLogin}>
						<label htmlFor="email" className="self-start text-xs ml-2">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="E-Mail"
							className="input"
						/>
						<label htmlFor="password" className="self-start text-xs ml-2">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="Password"
							className="input"
						/>
						<button type="submit" className="button text-accent">
							Login
						</button>
					</form>
				</div>
			) : (
				// The register form is displayed if an admin does not exist.
				<div className="flex flex-col justify-between py-10 px-8 gap-36 text-center ">
					<div>
						<h1 className="font-ubuntu text-4xl  mb-2">
							Create the Admin Account
						</h1>
						<span>
							As this is your first time using the app, please create an admin
							by setting an email and a password below and click register.
							<br></br> Once reigsterd you can login with the same credentials
							on the next page.
						</span>
					</div>
					<form className="flex flex-col gap-2" onSubmit={handleRegister}>
						<label htmlFor="firstname" className="self-start text-xs ml-2">
							Firstname
						</label>
						<input
							type="text"
							id="firstname"
							name="firstname"
							placeholder="Firstname"
							className="input"
						/>
						<label htmlFor="lastname" className="self-start text-xs ml-2">
							Lastname
						</label>
						<input
							type="text"
							id="lastname"
							name="lastname"
							placeholder="Lastname"
							className="input"
						/>
						<label htmlFor="email" className="self-start text-xs ml-2">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="E-Mail"
							className="input"
						/>
						<label htmlFor="password" className="self-start text-xs ml-2">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="Password"
							className="input"
						/>
						<button type="submit" className="button text-accent">
							Register
						</button>
					</form>
				</div>
			)}
		</>
	);
};

export default AdminLogin;

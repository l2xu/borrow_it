import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useEffect, useState } from "react";
import InstallPrompt from "../../components/InstallPrompt";
import { useAuth } from "../../context/AuthContext";

// The UserLogin component is used to display the user login page.
// It allows the user to login using their email and password.
const UserLogin = () => {
	const { login } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();

	// The useEffect hook is used to add an event listener for the beforeinstallprompt event.
	useEffect(() => {
		const handleBeforeInstallPrompt = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setShowInstallPrompt(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			);
		};
	}, []);

	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showInstallPrompt, setShowInstallPrompt] = useState(false);

	// The handleLogin function is used to make a POST request to login the user.
	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/login`,
				{
					email: e.target.email.value,
					password: e.target.password.value,
				}
			);
			const token = response.data.data;
			// setToken(token);
			login(token);
			window.navigator?.vibrate?.(50);

			navigate("/");
			showToast(response.data.message);
		} catch (error) {
			window.navigator?.vibrate?.([100, 50, 100]);

			showToast(error.response.data.message, "signal");
		}
	};

	// The handleInstallClick function is used to handle the install click event.
	const handleInstallClick = () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			deferredPrompt.userChoice.then((choiceResult) => {
				setDeferredPrompt(null);
				setShowInstallPrompt(false);
			});
		}
	};

	// The handleClose function is used to handle the close event.
	const handleClose = () => {
		setDeferredPrompt(null);
		setShowInstallPrompt(false);
	};

	return (
		<div>
			<img
				src="/images/login_boxes.jpg"
				alt="little boxes flying around"
				className="-mt-14"
			/>
			<div className="flex flex-col justify-between py-10 px-8 gap-36">
				<h1 className="font-ubuntu text-5xl">
					<span className="line-through">Buy it</span>
					<br></br>
					<span className="text-accent">Borrow it!</span>
				</h1>
				<form onSubmit={handleLogin} className="flex flex-col gap-2">
					<label htmlFor="email" className="text-xs ml-2">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						placeholder="Your beautiful email"
						className="input"
					/>
					<label htmlFor="password" className="text-xs ml-2">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						placeholder="Your super secret password"
						className="input"
					/>
					<button type="submit" className="button text-accent">
						Login
					</button>
				</form>
			</div>
			{showInstallPrompt && (
				// The install prompt is shown if the showInstallPrompt state is true.
				<InstallPrompt onInstall={handleInstallClick} onClose={handleClose} />
			)}
		</div>
	);
};

export default UserLogin;

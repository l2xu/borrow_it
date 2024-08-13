import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { keyConverter } from "../../utils/keyConverter";
import { useAuth } from "../../context/AuthContext";
import { BarLoader } from "react-spinners";

// The UserEditProfile component is used to edit the user profile.
// It fetches the user profile data from the API and allows the user to update the profile details.
const UserEditProfile = () => {
	const { getToken } = useAuth();
	const showToast = useToast();
	const [isSubscribed, setIsSubscribed] = useState(true);
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// The handleBack function is used to navigate back to the previous page.
	const handleBack = () => {
		window.history.back();
	};

	useEffect(() => {
		checkSubscription();
		getProfileData();
	}, []);

	// The getProfileData function is used to fetch the user profile data from the API.
	const getProfileData = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/user`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			setProfileData(response.data.data);
			setLoading(false);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to fetch profile data");
			showToast(
				error.response?.data?.message || "Failed to fetch profile data",
				"signal"
			);
			setLoading(false);
		}
	};

	// The handleSubmit function is used to make a PUT request to update the user profile.
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.put(
				`${process.env.REACT_APP_API_BASEURL}/user`,
				{
					email: e.target.email.value,
					password: e.target.password.value,
				},
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);

			showToast(response.data.message);
			window.navigator?.vibrate?.(50);

			handleBack();
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to update profile",
				"signal"
			);
		}
	};

	// The checkSubscription function is used to check if the user is subscribed to notifications.
	const checkSubscription = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/user/subscribed`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			setIsSubscribed(response.data.success);
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to check subscription",
				"signal"
			);
		}
	};

	// The handleSubscribe function is used to subscribe the user to notifications.
	const handleSubscribe = async () => {
		const registration = await navigator.serviceWorker.ready;

		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: keyConverter(process.env.REACT_APP_PUSH_KEY),
		});

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/subscribe`,
				{ subscription },
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			window.navigator?.vibrate?.(50);

			showToast(response.data.message);
			setIsSubscribed(true);
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to subscribe",
				"signal"
			);
		}
	};

	// The handleUnsubscribe function is used to unsubscribe the user from notifications.
	const handleUnsubscribe = async () => {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/unsubscribe`,
				{ subscription },
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			window.navigator?.vibrate?.(50);

			showToast(response.data.message);
			setIsSubscribed(false);
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to unsubscribe",
				"signal"
			);
		}
	};

	// The handleBack function is used to navigate back to the previous page.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error message is shown if there is an error fetching the profile data.
	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="flex flex-col flex-grow">
			<div className="flex gap-2 items-center mb-6">
				<button onClick={handleBack}>
					<ChevronLeft />
				</button>
				<h1 className="text-2xl font-medium">Edit Profile</h1>
			</div>
			<form onSubmit={handleSubmit} id="edit" className="flex flex-col gap-2">
				<label htmlFor="email" className="text-xs ml-2">
					Email
				</label>
				<input
					type="email"
					name="email"
					id="email"
					placeholder="Type your new email here"
					className="input mb-2"
					defaultValue={profileData.email || ""}
				/>
				<label htmlFor="password" className="text-xs ml-2 ">
					Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="Type your new password here"
					className="input"
				/>
			</form>
			<div className="mt-auto flex flex-col gap-2">
				{isSubscribed ? (
					// The button to unsubscribe is shown if the user is subscribed to notifications.
					<button className="button text-signal " onClick={handleUnsubscribe}>
						Unsubscribe to notifications
					</button>
				) : (
					// The button to subscribe is shown if the user is not subscribed to notifications.
					<button className="button text-accent" onClick={handleSubscribe}>
						Subscribe to Notifications
					</button>
				)}
				<button type="submit" form="edit" className="button text-accent ">
					Save
				</button>
			</div>
		</div>
	);
};

export default UserEditProfile;

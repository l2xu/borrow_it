import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { BarLoader } from "react-spinners";

// The UserProfile component is used to display the user's profile details.
// It fetches the user's profile data from the API and displays it on the screen.
const UserProfile = () => {
	const navigate = useNavigate();
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [alertVisibility, setAlertVisibility] = useState(false);
	const showToast = useToast();
	const { logout } = useAuth();
	const { getToken } = useAuth();

	useEffect(() => {
		getProfileData();
	}, []);

	// The getProfileData function is used to fetch the user's profile data from the API.
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

	// The handleLogout function is used to log the user out of the application.
	const handleLogout = () => {
		logout();
		navigate("/");
		showToast("Logged out successfully");
	};

	// The handleEdit function is used to navigate to the edit profile page.
	const handleEdit = () => {
		navigate("/profile/edit");
	};

	// The handleDelete function is used to delete the user's profile.
	const handleDelete = async () => {
		try {
			const response = await axios.delete(
				`${process.env.REACT_APP_API_BASEURL}/user`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			logout();
			navigate("/");
			showToast(response.data.message);
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to delete account",
				"signal"
			);
		}
	};

	// The BarLoader component is used to display a loading spinner.
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
			<h1 className="text-2xl font-medium mb-6">
				{profileData.firstname + " " + profileData.lastname}
			</h1>
			<div className="flex flex-col mb-4">
				<span className="normal">{profileData.email}</span>
				<span className="label">Email</span>
			</div>
			<div className="flex flex-col gap-2 mt-auto ">
				<button className="button text-accent" onClick={handleEdit}>
					Edit Profile
				</button>
				<button
					className="button text-signal"
					onClick={() => setAlertVisibility(true)}
				>
					Delete Profile
				</button>
				<button className="button" onClick={handleLogout}>
					Logout
				</button>
			</div>
			<Alert
				isVisible={alertVisibility}
				message="Are you sure that you want to delete your profile?"
				confirmButton="Yes, Delete my Profile!"
				onConfirm={handleDelete}
				cancelButton="No, don't Delete my Profile!"
				onCancel={() => setAlertVisibility(false)}
			/>
		</div>
	);
};

export default UserProfile;

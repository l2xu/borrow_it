import React from "react";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { BarLoader } from "react-spinners";

// The AdminEditUser component is used to edit a user by the admin.
// It fetches the user details from the API and allows the admin to edit the user details.
const AdminEditUser = () => {
	const showToast = useToast();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const user_id = window.location.pathname.split("/").pop();

	useEffect(() => {
		getUser();
	}, []);

	// The handleBack function is used to navigate back to the previous page.
	const handleBack = () => {
		window.history.back();
	};

	// The getUser function is used to fetch the user details from the API.
	const getUser = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/admin/users/${user_id}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			setUser(response.data.data);
			setLoading(false);
		} catch (error) {
			showToast(error.response.data.message, "signal");
			setLoading(false);
			setError(error.response?.data?.message || "Failed to fetch user");
		}
	};

	// The handleEdit function is used to make a PUT request to edit a user.
	const handleEdit = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.put(
				`${process.env.REACT_APP_API_BASEURL}/admin/users/${user_id}`,
				{
					firstname: e.target.firstname.value,
					lastname: e.target.lastname.value,
					email: e.target.email.value,
					password: e.target.password.value,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			showToast(response.data.message);
			window.history.back();
		} catch (error) {
			showToast(error.response.data.message, "signal");
		}
	};

	// The loading message is shown if the user details are being fetched.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error message is shown if there is an error fetching the user details.
	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="p-4">
			<div className="flex gap-2 mb-6">
				<button onClick={handleBack}>
					<ChevronLeft />
				</button>
				<h1 className="text-2xl font-medium">Edit User</h1>
			</div>

			<form className="flex flex-col gap-2" onSubmit={handleEdit}>
				<label htmlFor="firstname" className="text-xs ml-2">
					Firstname
				</label>

				<input
					type="text"
					id="firstname"
					name="firstname"
					className="input"
					value={user.firstname}
					onChange={(e) => {
						setUser({ ...user, firstname: e.target.value });
					}}
				/>
				<label htmlFor="lastname" className="text-xs ml-2">
					Lastname
				</label>
				<input
					type="text"
					id="lastname"
					name="lastname"
					className="input"
					value={user.lastname}
					onChange={(e) => {
						setUser({ ...user, lastname: e.target.value });
					}}
				/>
				<label htmlFor="email" className="text-xs ml-2">
					Email
				</label>
				<input
					type="email"
					id="email"
					name="email"
					className="input"
					value={user.email}
					onChange={(e) => {
						setUser({ ...user, email: e.target.value });
					}}
				/>
				<label htmlFor="password" className="text-xs ml-2">
					Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					className="input"
					placeholder="******************"
				/>
				<input type="submit" value="Edit User" className="button text-accent" />
			</form>
		</div>
	);
};

export default AdminEditUser;

import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { BarLoader } from "react-spinners";

// The AdminDashboard component is used to display the admin dashboard.
// It fetches the list of users from the API and displays them in a table.
const AdminDashboard = () => {
	const { logout } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();
	const [users, setUsers] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [alertVisibility, setAlertVisibility] = useState(false);
	const [user_id, setUser_id] = useState(null);

	useEffect(() => {
		getUsers();
	}, []);

	// The getUsers function is used to fetch the list of users from the API.
	const getUsers = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/admin/users`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			setUsers(response.data.data);
			setLoading(false);
		} catch (error) {
			showToast(error.response.data.message, "signal");
			setLoading(false);
			setError(error.response?.data?.message || "Failed to fetch users");
		}
	};

	// The handleEdit function is used to navigate to the edit user page.
	const handleEdit = (user_id) => {
		navigate(`/admin/dashboard/edit/${user_id}`);
	};

	// The toggleAlert function is used to show the delete user alert.
	const toggleAlert = (user_id) => {
		setAlertVisibility(true);
		setUser_id(user_id);
	};

	// The handleDelete function is used to make a DELETE request to delete a user.
	const handleDelete = async () => {
		try {
			const response = await axios.delete(
				`${process.env.REACT_APP_API_BASEURL}/admin/users/${user_id}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			showToast(response.data.message);

			getUsers();
			setAlertVisibility(false);
		} catch (error) {
			showToast(error.response.data.message, "signal");
		}
	};

	// The handleAddNewUser function is used to navigate to the add user page.
	const handleAddNewUser = () => {
		navigate("/admin/dashboard/add");
	};

	// The handleLogout function is used to logout the user.
	const handleLogout = () => {
		logout();
		showToast("Logged out successfully");
		navigate("/admin/login");
	};

	// The loading state is used to show a loading message while fetching the users.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error state is used to show an error message if the users cannot be fetched.
	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="p-8">
			<h1 className="text-2xl font-medium mb-6"> Dashboard </h1>
			<div className="float-right flex gap-2 mb-10">
				<button className="button text-accent" onClick={handleAddNewUser}>
					Add User
				</button>
				<button className="button text-signal" onClick={handleLogout}>
					Logout
				</button>
			</div>

			<table className="table-auto w-full">
				<thead>
					<tr>
						<th className="text-left px-4 py-2">User-ID</th>
						<th className="text-left px-4 py-2">Firstname</th>
						<th className="text-left px-4 py-2">Lastname</th>
						<th className="text-left px-4 py-2">Email</th>
						<th className="text-left px-4 py-2">Edit</th>
						<th className="text-left px-4 py-2">Delete</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr
							key={user.user_id}
							className={`w-3/4 rounded-2xl  py-2 px-4
                ${user.role === "admin" ? "text-accent font-bold" : ""}`}
						>
							<td className=" px-4 py-2">{user.user_id}</td>

							<td className=" px-4 py-2">{user.firstname}</td>
							<td className=" px-4 py-2">{user.lastname}</td>
							<td className=" px-4 py-2">{user.email}</td>
							<td className=" px-4 py-2">
								<button
									className="button text-accent"
									onClick={() => handleEdit(user.user_id)}
								>
									Edit
								</button>
							</td>
							<td className=" px-4 py-2">
								{user.role === "admin" ? null : (
									<button
										className="button text-signal"
										onClick={() => toggleAlert(user.user_id)}
									>
										Delete
									</button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Alert
				isVisible={alertVisibility}
				message="Are you sure that you want to delete this user?"
				confirmButton="Yes, Delete the User!"
				onConfirm={handleDelete}
				cancelButton="No, don't Delete the User!"
				onCancel={() => setAlertVisibility(false)}
			/>
		</div>
	);
};

export default AdminDashboard;

import React from "react";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

// The AdminAddUser component is used to add a new user by the admin.
// It contains a form to add a new user with firstname, lastname, email, and password fields.
const AdminAddUser = () => {
	const showToast = useToast();
	const handleBack = () => {
		window.history.back();
	};

	// The handleAddUser function is used to make a POST request to add a new user.
	const handleAddUser = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/admin/users`,

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

	return (
		<div className="p-4">
			<div className="flex gap-2 mb-6 ">
				<button onClick={handleBack}>
					<ChevronLeft />
				</button>
				<h1 className="text-2xl font-medium "> Add User</h1>
			</div>

			<form className="flex flex-col gap-2" onSubmit={handleAddUser}>
				<label htmlFor="firstname" className="text-xs ml-2">
					Firstname
				</label>
				<input
					type="text"
					id="firstname"
					name="firstname"
					placeholder="Max"
					className="input"
				/>
				<label htmlFor="lastname" className="text-xs ml-2">
					Lastname
				</label>
				<input
					type="text"
					id="lastname"
					name="lastname"
					placeholder="Mustermann"
					className="input"
				/>
				<label htmlFor="email" className="text-xs ml-2">
					Email
				</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="max@mustermann@googlemail.com"
					className="input"
				/>
				<label htmlFor="password" className="text-xs ml-2">
					Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="**********"
					className="input"
				/>
				<input type="submit" value="Add User" className="button text-accent" />
			</form>
		</div>
	);
};

export default AdminAddUser;

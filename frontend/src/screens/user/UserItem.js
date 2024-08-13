import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { BarLoader } from "react-spinners";

// The UserItem component is used to display the details of an item posted by the user.
// It fetches the item details from the API and displays them on the screen.
const UserItem = () => {
	const { getToken } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();
	const item_id = window.location.pathname.split("/").pop();

	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		getItem();
	}, []);

	// The getItem function is used to fetch the item details from the API.
	const getItem = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/user/items/${item_id}`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			setItem(response.data.data);
			setLoading(false);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to fetch item");
			showToast(
				error.response?.data?.message || "Failed to fetch item",
				"signal"
			);
			setLoading(false);
		}
	};

	// The handleBack function is used to navigate back to the previous page.
	const handleBack = () => {
		window.history.back();
	};

	// The handleRequest function is used to send a request to the user for the item.
	const handleRequest = async () => {
		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/chats`,
				{
					item_id: item.item_id,
					user_id: item.user_id,
				},
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			window.navigator?.vibrate?.(50);
			showToast(response.data.message);
			navigate(`/chat/${response.data.data}`);
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to send request",
				"signal"
			);
		}
	};

	// The loading message is shown if the item details are being fetched.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error message is shown if there is an error fetching the item details.
	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="flex flex-col flex-grow">
			<div className="flex justify-between gap-4 items-center mb-6">
				<div className="flex gap-2 items-center">
					<button onClick={handleBack}>
						<ChevronLeft />
					</button>
					<h1 className="text-xl font-medium">{item.title || "Untitled"}</h1>
				</div>
				<div>
					<div className="text-xs flex items-center gap-1">
						<UserRound size={16} />
						<span>{`${item.firstname || "First Name"} ${
							item.lastname || "Last Name"
						}`}</span>
					</div>
				</div>
			</div>
			<img
				src={`${process.env.REACT_APP_API_BASEURL}/uploads/${
					item.image_path || "default.png"
				}`}
				alt={item.title || "Untitled"}
				className="w-full h-[150px] object-cover rounded-[14px] mb-4 border-[1px] border-gray"
			/>
			<p className="text">{item.description || "No description available."}</p>
			<button className="button text-accent mt-auto" onClick={handleRequest}>
				Request Item
			</button>
		</div>
	);
};

export default UserItem;

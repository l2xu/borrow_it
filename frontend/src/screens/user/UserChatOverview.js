import React, { useEffect, useState } from "react";
import axios from "axios";
import ListChat from "../../components/ListChat";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { BarLoader } from "react-spinners";

// The UserChatOverview component is used to display the list of chats available to the user.
// It fetches the list of chats from the API and displays them in a list.
const UserChatOverview = () => {
	const { getToken } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();

	const [chats, setChats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		getChats();
	}, []);

	// The getChats function is used to fetch the list of chats from the API.
	const getChats = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/user/chats`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			setChats(response.data.data);
			setLoading(false);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to fetch chats");
			showToast(
				error.response?.data?.message || "Failed to fetch chats",
				"signal"
			);
			setLoading(false);
		}
	};

	// The handleClick function is used to navigate to the chat page.
	const handleClick = (chat_id) => {
		navigate(`/chat/${chat_id}`);
	};

	// The BarLoader component is used to display a loading spinner.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error message is displayed if there was an error fetching the chats.
	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h1 className="text-2xl font-medium mb-6">Chats</h1>

			<div className="flex flex-col gap-2">
				{chats.length > 0 ? (
					// The ListChat component is used to display the chat details.
					chats.map((chat) => (
						<div
							key={chat.chat_id}
							onClick={() => {
								handleClick(chat.chat_id);
							}}
						>
							<ListChat
								{...chat}
								title={chat.title || "Untitled Chat"}
								lastMessage={chat.lastMessage || "No messages yet."}
							/>
						</div>
					))
				) : (
					// The message is displayed if there are no chats available.
					<p>No chats available.</p>
				)}
			</div>
		</div>
	);
};

export default UserChatOverview;

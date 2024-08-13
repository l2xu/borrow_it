import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, Send, UserRound } from "lucide-react";
import Chatbubble from "../../components/Chatbubble";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { BarLoader } from "react-spinners";

// The UserChat component is used to display the chat between two users.
// It fetches the chat messages from the API and displays them in a chat bubble.
const UserChat = () => {
	const { getToken } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();
	const chat_id = window.location.pathname.split("/").pop();

	const [chat, setChat] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const messagesEndRef = useRef(null); // Reference for the messages container
	const [alertVisibility, setAlertVisibility] = useState(false);

	useEffect(() => {
		getChat();
	}, []);

	useEffect(() => {
		scrollToBottom(); // Scroll to bottom whenever chat messages change
	}, [chat]);

	// The getChat function is used to fetch the chat messages from the API.
	const getChat = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/user/chats/${chat_id}/messages`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			setChat(response.data.data);
			setLoading(false);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to fetch chat");
			showToast(
				error.response?.data?.message || "Failed to fetch chat",
				"signal"
			);
			setLoading(false);
		}
	};

	// The handleBack function is used to navigate back to the previous page.
	const handleBack = () => {
		window.history.back();
		setAlertVisibility(false);
	};

	// The handleSubmit function is used to make a POST request to send a message.
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/messages`,
				{
					chat_id: chat_id,
					content: e.target.message.value,
				},
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			e.target.reset();
			getChat();
			scrollToBottom();
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to send message",
				"signal"
			);
		}

		// Notify the other user about the new message
		try {
			await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/notify/new_message`,
				{
					user_id: chat.other_user_id,
					title: "New Message",
					message: e.target.message.value,
				},
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
		} catch (error) {
			// no need to show error here as it's not critical to the user
		}
	};

	// The scrollToBottom function is used to scroll to the bottom of the chat messages.
	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	// The handleShowItem function is used to navigate to the item page.
	const handleShowItem = () => {
		navigate(`/item/${chat.item_id}`);
	};

	// The toggleAlert function is used to show the delete chat alert.
	const toggleAlert = () => {
		setAlertVisibility(true);
	};

	// The handleDelete function is used to make a DELETE request to delete a chat.
	const handleDelete = async () => {
		try {
			const response = await axios.delete(
				`${process.env.REACT_APP_API_BASEURL}/user/chats/${chat_id}`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			navigate("/chat");
			showToast(response.data.message);
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to delete chat",
				"signal"
			);
		}
	};

	// The loading message is shown if the chat messages are being fetched.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error message is shown if there is an error fetching the chat messages.
	if (error) {
		return <div>{error}</div>;
	}

	return (
		<>
			<div>
				<div className="mb-6 fixed bg-white top-0 p-4 left-0 right-0 border-b border-gray">
					<div className="flex gap-2 items-center justify-between mb-2 ">
						<div className="flex gap-2 items-center">
							<button onClick={handleBack}>
								<ChevronLeft />
							</button>
							<h1 className="text-xl font-medium">{chat.item_name}</h1>
						</div>
						<div>
							<div className="text-xs flex items-center gap-1">
								<UserRound size={16} /> <span>{chat.other_user_name}</span>
							</div>
						</div>
					</div>
					<div className="flex gap-2 justify-end">
						<button
							className="text-signal border border-gray rounded-lg p-1 meta px-2 float-right"
							onClick={toggleAlert}
						>
							Delete Chat
						</button>
						<button
							className="text-accent border border-gray rounded-lg p-1 meta px-2 float-right"
							onClick={handleShowItem}
						>
							Show Item
						</button>
					</div>
				</div>
				<div className="flex flex-col gap-2 mb-16 mt-24">
					{chat.messages.map((message) => (
						<Chatbubble
							key={message.message_id}
							text={message.content}
							time={message.created_at}
							is_me={message.sender_id === chat.current_user_id}
						/>
					))}
					<div ref={messagesEndRef} />{" "}
					{/* This is the reference to scroll to */}
				</div>
				<form
					onSubmit={handleSubmit}
					className="flex items-center fixed bottom-20 p-1 left-4 right-4 bg-white rounded-[14px] shadow-md gap-2 border border-gray"
				>
					<input
						type="text"
						name="message"
						placeholder="Your message"
						className="flex-1 border-none outline-none px-2"
						required
					/>
					<button type="submit" className="text-accent p-2 rotate-45">
						<Send />
					</button>
				</form>
			</div>

			<Alert
				isVisible={alertVisibility}
				message="Are you sure that you want to delete this chat?"
				confirmButton="Yes, Delete the Chat!"
				onConfirm={handleDelete}
				cancelButton="No, don't Delete the Chat!"
				onCancel={() => setAlertVisibility(false)}
			/>
		</>
	);
};

export default UserChat;

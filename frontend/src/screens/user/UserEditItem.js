import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { BarLoader } from "react-spinners";

// The UserEditItem component is used to edit an item posted by the user.
// It fetches the item details from the API and allows the user to update the item details.
const UserEditItem = () => {
	const { getToken } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();
	const item_id = window.location.pathname.split("/").pop();
	const [item, setItem] = useState({});
	const [initialItem, setInitialItem] = useState({});
	const [imagePreview, setImagePreview] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const fileInputRef = useRef();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [alertVisibility, setAlertVisibility] = useState(false);

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
			const fetchedItem = response.data.data;
			setItem(fetchedItem);
			setInitialItem(fetchedItem);
			setImagePreview(
				`${process.env.REACT_APP_API_BASEURL}/uploads/${fetchedItem.image_path}`
			);
			setLoading(false);
		} catch (error) {
			handleError(error, "Failed to fetch item");
			setLoading(false);
		}
	};

	// The handleImageChange function is used to handle the image change event.
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setSelectedImage(file);
		setImagePreview(file ? URL.createObjectURL(file) : null);
	};

	// The handleImageClick function is used to trigger the file input click event.
	const handleImageClick = () => {
		fileInputRef.current.click();
	};

	// The handleSubmit function is used to handle the form submission.
	const handleSubmit = async (e) => {
		e.preventDefault();
		const promises = [];

		if (selectedImage) {
			promises.push(uploadImage());
		}

		if (
			item.title !== initialItem.title ||
			item.description !== initialItem.description
		) {
			promises.push(updateItem());
		}

		try {
			await Promise.all(promises);
			showToast("Item updated successfully!");
			navigate("/user-items");
		} catch (error) {
			handleError(error, "Failed to update item");
		}
	};

	// The uploadImage function is used to upload the selected image to the server.
	const uploadImage = async () => {
		const formData = new FormData();
		formData.append("image", selectedImage);

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/items/${item_id}/image`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);
			showToast(response.data.message);
		} catch (error) {
			throw error;
		}
	};

	// The updateItem function is used to update the item details in the API.
	const updateItem = async () => {
		if (!item.title || !item.description) {
			showToast("Title and description cannot be empty", "signal");
			return;
		}

		try {
			const response = await axios.put(
				`${process.env.REACT_APP_API_BASEURL}/user/items/${item_id}`,
				{
					title: item.title,
					description: item.description,
				},
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			window.navigator?.vibrate?.(50);
			showToast(response.data.message);
			navigate("/user-items");
		} catch (error) {
			throw error;
		}
	};

	// The handleError function is used to handle API errors and show a toast message.
	const handleError = (error, fallbackMessage) => {
		const errorMessage = error.response?.data?.message || fallbackMessage;
		showToast(errorMessage, "signal");
	};

	// The handleBack function is used to navigate back to the previous page.
	const handleBack = () => {
		window.history.back();
	};

	// The handleDelete function is used to delete the item from the API.
	const handleDelete = async () => {
		try {
			const response = await axios.delete(
				`${process.env.REACT_APP_API_BASEURL}/user/items/${item_id}`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			showToast(response.data.message);
			navigate("/user-items");
		} catch (error) {
			handleError(error, "Failed to delete item");
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
					<h1 className="text-2xl font-medium">Edit Item</h1>
				</div>
			</div>

			<form onSubmit={handleSubmit} id="my-form">
				<Alert
					isVisible={alertVisibility}
					message="Are you sure that you want to delete this item?"
					confirmButton="Yes, Delete the Item!"
					onConfirm={handleDelete}
					cancelButton="No, don't Delete the Item!"
					onCancel={() => setAlertVisibility(false)}
				/>
				<label htmlFor="title" className="text-xs ml-2">
					Title
				</label>
				<input
					name="title"
					id="title"
					type="text"
					placeholder="Title"
					value={item.title || ""}
					onChange={(e) => setItem({ ...item, title: e.target.value })}
					className="input mb-2"
					required
				/>
				<label htmlFor="description" className="text-xs ml-2">
					Description
				</label>
				<textarea
					name="description"
					id="description"
					placeholder="Description"
					value={item.description || ""}
					onChange={(e) => setItem({ ...item, description: e.target.value })}
					className="input h-60 mb-2"
					required
				></textarea>
				<label htmlFor="image" className="text-xs ml-2">
					Image
				</label>
				<input
					name="image"
					id="image"
					type="file"
					className="hidden"
					ref={fileInputRef}
					onChange={handleImageChange}
				/>
				{imagePreview ? (
					// The image preview is shown if an image is selected.
					<div className="mb-4">
						<img
							src={imagePreview}
							alt="Preview"
							className="w-full h-40 object-cover border-[0.5px] border-gray rounded-[14px] cursor-pointer"
							onClick={handleImageClick}
						/>
					</div>
				) : (
					// The image selection button is shown if no image is selected.
					<div
						className="w-full h-40 border-[1px] border-gray-300 p-2 rounded-[14px] flex items-center justify-center cursor-pointer mb-4"
						onClick={handleImageClick}
					>
						<span>Select an image</span>
					</div>
				)}
			</form>
			<div className="mt-auto flex flex-col gap-2">
				<button
					type="submit"
					form="my-form"
					className="button w-full text-accent"
				>
					Update Item
				</button>
				<button
					className="button text-signal w-full  "
					onClick={() => setAlertVisibility(true)}
				>
					Delete the Item
				</button>
			</div>
		</div>
	);
};

export default UserEditItem;

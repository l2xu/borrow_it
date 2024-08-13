import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// The UserAddItem component is used to display the add item form for the user.
// It allows the user to add an item with a title, description, and image.
const UserAddItem = () => {
	const { getToken } = useAuth();
	const showToast = useToast();
	const navigate = useNavigate();
	const [imagePreview, setImagePreview] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const fileInputRef = useRef(); // Reference to the file input

	// The handleSubmit function is used to handle the form submission.
	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		if (selectedImage) {
			formData.append("image", selectedImage);
		}

		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_BASEURL}/user/items`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			showToast(response.data.message);
			window.navigator?.vibrate?.(50);

			navigate("/user-items");
		} catch (error) {
			showToast(error.response.data.message, "signal");
		}
	};

	// The handleImageChange function is used to handle the image change event.
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedImage(file);
			setImagePreview(URL.createObjectURL(file));
		} else {
			setSelectedImage(null);
			setImagePreview(null);
		}
	};

	const handleImageClick = () => {
		fileInputRef.current.click(); // Trigger file input click
	};

	return (
		<form
			onSubmit={handleSubmit}
			encType="multipart/form-data"
			className="flex flex-col flex-grow"
		>
			<h1 className="text-2xl font-medium mb-6">Add an Item</h1>

			<label htmlFor="title" className="text-xs ml-2">
				Title
			</label>
			<input
				name="title"
				id="title"
				type="text"
				placeholder="A title that descirbes your item well"
				className="input mb-2"
				required
			/>

			<label htmlFor="description" className="text-xs ml-2">
				Description
			</label>
			<textarea
				name="description"
				id="description"
				placeholder="A description of your item that lists its features"
				className="input h-60 mb-2"
				required
			></textarea>

			<label htmlFor="image" className="text-xs ml-2">
				Image
			</label>
			<input
				name="image"
				type="file"
				className="hidden" // Hide the file input
				ref={fileInputRef}
				id="image"
				onChange={handleImageChange}
				required
			/>

			{imagePreview ? (
				<div className="mb-4">
					<img
						src={imagePreview}
						alt="Preview"
						className="w-full h-40 object-cover rounded-[14px] cursor-pointer border-[0.5px] border-gray "
						onClick={handleImageClick}
					/>
				</div>
			) : (
				<div
					className="w-full h-40 object-contain border-[0.5px] border-gray p-2 rounded-[14px] flex items-center justify-center cursor-pointer mb-4"
					onClick={handleImageClick}
				>
					<span className="text-gray">Select an image</span>
				</div>
			)}

			<button type="submit" className="button w-full text-accent mt-auto">
				Add Item
			</button>
		</form>
	);
};

export default UserAddItem;

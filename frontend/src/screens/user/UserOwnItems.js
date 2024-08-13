import React, { useState, useEffect } from "react";
import ListItemBrowse from "../../components/ListItemBrowse";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { BarLoader } from "react-spinners";

// The UserOwnItems component is used to display the items owned by the user.
// It fetches the list of items from the API and displays them in a list.
const UserOwnItems = () => {
	const showToast = useToast();
	const { getToken } = useAuth();
	const [items, setItems] = useState(null);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		loadData();
	}, []);

	// The loadData function is used to fetch the list of items owned by the user from the API.
	const loadData = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_BASEURL}/user/items?userItems`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`,
					},
				}
			);
			setItems(response.data.data);
			setLoading(false);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to fetch items");
			showToast(
				error.response?.data?.message || "Failed to fetch items",
				"signal"
			);
			setLoading(false);
		}
	};

	// The handleClick function is used to handle the item click event.
	const handleClick = (id) => {
		navigate(`/user-items/${id}`);
	};

	// The handleSearch function is used to handle the search event.
	const handleSearch = (e) => {
		setSearch(e.target.value);
	};

	// The BarLoader component is used to display a loading spinner.
	if (loading) {
		return (
			<div className="flex flex-col justify-center h-screen items-center  ">
				<BarLoader />
			</div>
		);
	}

	// The error message is shown if there is an error fetching the items.
	if (error) {
		return <div>{error}</div>;
	}

	// The UserOwnItems component returns the JSX of the items owned by the user.
	const filteredItems = items.filter((item) =>
		item.title.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<>
			{items.length > 0 ? (
				// The ListItemBrowse component is used to display the item details.
				<div className="h-full max-h-full">
					<input
						type="search"
						className="w-full border-[1px] border-gray p-2 rounded-[14px] mb-4"
						placeholder="Search for items"
						value={search}
						onChange={handleSearch}
					/>

					<div className="flex flex-col gap-2 overflow-clip">
						{filteredItems.map((item) => (
							<div
								key={item.item_id}
								onClick={() => {
									handleClick(item.item_id);
								}}
							>
								<ListItemBrowse
									title={item.title || "Untitled"}
									description={item.description || "No description available."}
									image_path={item.image_path || "default.png"}
								/>
							</div>
						))}
					</div>
				</div>
			) : (
				// The no items message is displayed if no items are available
				<p>No items available.</p>
			)}
		</>
	);
};

export default UserOwnItems;

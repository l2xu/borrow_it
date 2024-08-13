import React from "react";
import { UserRound } from "lucide-react";
import { truncateMessage } from "../utils/truncateText";

// The ListItemBrowse component is used to show the list of items in the browse page.
// It takes title, description, user, and image_path as props.
const ListItemBrowse = ({ title, description, user, image_path }) => {
	return (
		<div className="flex gap-2 rounded-[14px] border-[1px] border-gray">
			<img
				src={`${process.env.REACT_APP_API_BASEURL}/uploads/${image_path}`}
				alt="your_item"
				className="rounded-[14px] w-[100px] h-[100px] object-cover rounded-r-none"
			/>

			<div className="py-2 px-4">
				<h2 className="text-lg font-medium mb-2">{title}</h2>
				<p className="text-sm mb-2">{truncateMessage(description, 30)}</p>
				{user && (
					<div className="text-xs flex items-center gap-1">
						<UserRound size={16} /> <span>{user}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default ListItemBrowse;

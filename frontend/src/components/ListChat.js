import React from "react";
import { UserRound } from "lucide-react";
import { parseDate } from "../utils/dateConverter";
import { truncateMessage } from "../utils/truncateText";

// ListChat component is used to show the list of chats in the chat list.
// It takes item_image, item_name, latest_message, name, unread_count, and created_at as props.
const ListChat = ({
	item_image,
	item_name,
	latest_message,
	name,
	unread_count,
	created_at,
}) => {
	return (
		<div className="flex gap-2 rounded-[14px] border-[1px] border-gray">
			<img
				src={`${process.env.REACT_APP_API_BASEURL}/uploads/${item_image}`}
				alt="your_item"
				className="rounded-[14px] w-[100px] h-[100px] object-cover rounded-r-none"
			/>

			<div className="py-2 px-4 w-full meta">
				<h2 className="text-lg font-medium mb-1">{item_name}</h2>
				{name && (
					<div className="flex items-center justify-between w-full text-xs">
						<div className="flex items-center gap-2 ">
							<UserRound size={16} /> <span>{name}</span>
						</div>
						<span
							className={` ${
								unread_count > 0 ? "bg-accent" : "bg-white"
							} text-white w-4 flex items-center justify-center rounded-full aspect-square`}
						>
							{unread_count}
						</span>
					</div>
				)}
				<div className="mt-2 italic text-sm flex justify-between">
					<div>{truncateMessage(latest_message, 26)}</div>
					<div> {parseDate(created_at)}</div>
				</div>
			</div>
		</div>
	);
};

export default ListChat;

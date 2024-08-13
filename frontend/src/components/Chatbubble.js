import { parseDate } from "../utils/dateConverter";

// Chatbubble component is used to show chat bubbles in the chat window.
// It takes text, time, and is_me as props.
// depending on is_me, it will show the chat bubble on the right or left side with the appropriate color.
const Chatbubble = ({ text, time, is_me }) => {
	return (
		<div
			className={`w-3/4 rounded-2xl  py-2 px-4
                ${
									is_me
										? "self-end bg-blue-200 rounded-tr-none"
										: "self-start bg-gray rounded-tl-none"
								}`}
		>
			<p>{text}</p>
			<span className="text-xs float-end mt-1">{parseDate(time)}</span>
		</div>
	);
};

export default Chatbubble;

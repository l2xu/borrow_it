// This component is used to show an alert message to the user.
// It takes isVisible, message, onConfirm, onCancel, confirmButton, and cancelButton as props.
const Alert = ({
	isVisible,
	message,
	onConfirm,
	onCancel,
	confirmButton,
	cancelButton,
}) => {
	return (
		<div
			className={`fixed z-50 bottom-0 right-0 left-0 bg-signal text-white h-fit p-8 rounded-t-3xl flex flex-col gap-4 align-bottom justify-end transition-all duration-500 ${
				isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
			}`}
		>
			<p>{message}</p>
			<p className="mb-5">After it's deleted, it can't be restored!</p>
			<button className="button w-full" onClick={onConfirm}>
				{confirmButton}
			</button>
			<button
				onClick={onCancel}
				className="button bg-white text-accent border-white"
			>
				{cancelButton}
			</button>
		</div>
	);
};

export default Alert;

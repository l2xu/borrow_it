// The InstallPrompt component is a simple component that displays a message to the user to install the app on their device.
// It has two buttons, one to install the app and the other to close the prompt.
// The onInstall and onClose props are functions that are called when the user clicks on the install and close buttons respectively.
const InstallPrompt = ({ onInstall, onClose }) => {
	return (
		<div className="fixed top-0 left-0 h-screen right-0 bg-accent text-white p-8 py-4 flex flex-col justify-center items-center gap-4">
			<h1 className="text-4xl mb-4"> Welcome to Borrow It.</h1>
			<p>
				The text has several grammatical and typographical issues. Here’s a
				corrected version: Borrow It is intended to be used as a mobile app on
				your smartphone and not in the browser you are currently using. To get
				the best user experience, we highly recommend installing this app by
				clicking the install button below. After that, you can use Borrow It
				like any other app on your smartphone and access it from your home
				screen.
			</p>
			<button
				onClick={onInstall}
				className="text-xl bg-white text-accent px-4 py-2 rounded mt-12 w-full"
			>
				Install Borrow It
			</button>
			<button
				onClick={onClose}
				className="border text-small text-white px-4 py-2 rounded w-full"
			>
				No thanks, I dont want the best user experience
			</button>
		</div>
	);
};

export default InstallPrompt;

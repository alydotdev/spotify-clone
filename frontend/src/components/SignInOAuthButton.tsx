import { useSignIn } from "@clerk/clerk-react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
	const { signIn, isLoaded } = useSignIn();

	if (!isLoaded) {
		return null;
	}

	const signInWithGoogle = () => {
		signIn.authenticateWithRedirect({
			strategy: "oauth_google",
			redirectUrl: "/sso-callback",
			redirectUrlComplete: "/auth-callback",
		});
	};

	return (
		<Button
			onClick={signInWithGoogle}
			variant='outline'
			size='sm'
			aria-label='Continue with Google'
			className='shrink-0 gap-2 px-2 sm:px-3 border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white'
		>
			<img src='/google.png' alt='' className='size-4 sm:size-5 shrink-0' aria-hidden='true' />
			<span className='hidden sm:inline'>Continue with Google</span>
		</Button>
	);
};
export default SignInOAuthButtons;
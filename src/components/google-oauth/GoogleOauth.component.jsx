import React from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'react-toastify';

import GoogleIcon from '../../assets/svg/googleIcon.svg';
import { db } from '../../firebase/firebase.config';

const GoogleOAuth = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const onGoogleOAuthButtonClick = async () => {
		try {
			const auth = getAuth();
			const googleProvider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, googleProvider);
			const user = result.user;

			const userDocRef = doc(db, 'users', user.uid);
			const userSnapShot = await getDoc(userDocRef);

			if (!userSnapShot.exists()) {
				await setDoc(doc(db, 'users', user.uid), {
					name: user.displayName,
					email: user.email,
					timeStamp: serverTimestamp(),
				});
			}
			toast.success('Google authentication has been approved', {
				theme: 'colored',
			});
			navigate('/');
		} catch (error) {
			console.log(error);
			toast.error(
				'Could not authenticate with Google! Please try again.',
				{ theme: 'colored' }
			);
		}
	};
	return (
		<div className='socialLogin'>
			<p>
				{location.path === '/register'
					? 'Register With Google'
					: 'Sign In with Google'}
			</p>
			<button
				className='socialIconDiv'
				onClick={onGoogleOAuthButtonClick}
			>
				<img
					src={GoogleIcon}
					alt="{location.path === '/register'
					? 'Register With Google'
					: 'Sign In with Google'}"
					className='socialIconImg'
				/>
			</button>
		</div>
	);
};

export default GoogleOAuth;

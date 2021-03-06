import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebase.config';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Spinner from '../../components/spinner/Spinner.component';
import ShareIcon from '../../assets/svg/shareIcon.svg';
import 'swiper/css/bundle'

const AdvertisedListing = () => {
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);
	const [shareLinkCopied, setShareLinkCopied] = useState(false);

	const navigate = useNavigate();
	const params = useParams();
	const auth = getAuth();

	useEffect(() => {
		const getListing = async () => {
			const docRef = doc(db, 'listing', params.listingId);
			const docSnapShot = await getDoc(docRef);

			if (docSnapShot.exists()) {
				console.log(docSnapShot.data());
				setListing(docSnapShot.data());
				setLoading(false);
			}
		};

		getListing();
	}, [navigate, params.listingId]);

	if (loading) {
		return <Spinner />;
	}
	return (
		<main>
			<Swiper
				modules={[Navigation, Pagination, Scrollbar, A11y]}
				slidesPerView={1}
				navigation
				pagination={{ clickable: true }}
				scrollbar={{ draggable: true }}
			>
				{listing.imageUrls.map((url, index) => (
					<SwiperSlide key={index}>
						<div
							style={{
								background: `url(${listing.imageUrls[index]}) center no-repeat`,
								backgroundSize: 'cover',
								objectFit: 'contain',
								height: '78vh'
							}}
							className='swiperSlideDiv'
						></div>
					</SwiperSlide>
				))}
			</Swiper>
			<div
				className='shareIconDiv'
				onClick={() => {
					navigator.clipboard.writeText(window.location.href);
					setShareLinkCopied(true);
					setTimeout(() => {
						setShareLinkCopied(false);
					}, 2000);
				}}
			>
				<img src={ShareIcon} alt='Share this...' />
			</div>
			{shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}
			<div className='listingDetails'>
				<p className='listingName'>
					{listing.name} - $
					{listing.offer
						? listing.discountedPrice
								.toString()
								.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
						: listing.regularPrice
								.toString()
								.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
				</p>
				<p className='listingLocation'>{listing.location}</p>
				<p className='listingType'>
					For {listing.type === 'rent' ? 'Rent' : 'Sale'}
				</p>
				{listing.offer && (
					<p className='discountPrice'>
						${listing.regularPrice - listing.discountedPrice}{' '}
						Discount
					</p>
				)}
				<ul className='listingDetailsList'>
					<li>
						{listing.bedrooms > 1
							? `${listing.bedrooms} Bedrooms`
							: '1 Bedroom'}
					</li>
					<li>
						{listing.bathrooms > 1
							? `${listing.bathrooms} Bathrooms`
							: '1 Bathroom'}
					</li>
					<li>
						{listing.parking
							? 'Parking Spot Available.'
							: 'No Parking Spot Available.'}
					</li>
					<li>
						{listing.furnished
							? 'Property is furnished'
							: 'Unfurnished Property'}
					</li>
				</ul>
				<p className='listingLocationTitle'>Location</p>
				<div className='leafletContainer'>
					<MapContainer
						style={{ height: '100%', width: '100%' }}
						center={[
							listing.geolocation.lat,
							listing.geolocation.lng,
						]}
						zoom={13}
						scrollWheelZoom={false}
					>
						<TileLayer
							attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
						/>

						<Marker
							position={[
								listing.geolocation.lat,
								listing.geolocation.lng,
							]}
						>
							<Popup>{listing.location}</Popup>
						</Marker>
					</MapContainer>
				</div>
				{auth.currentUser?.uid !== listing.userRef && (
					<Link
						to={`/contact/${listing.userRef}?listingName=${listing.name}`}
						className='primaryButton'
					>
						Contact Landlord or Agent
					</Link>
				)}
			</div>
		</main>
	);
};

export default AdvertisedListing;

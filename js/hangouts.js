angular.module('hangouts', ['firebase'])

.service('Hangouts', ['$firebaseArray', 'fbloginService',
											function($firebaseArray, fbloginService){
    
    var ref = firebase.database().ref()
		var hangoutsRef = ref.child('hangouts');
    var hangoutsArray = $firebaseArray(hangoutsRef);

		function isGuestOfHangout(hangout, guest) {
				console.debug('isGuestOfHangout(hangout, guest):', hangout, guest);
				if (!hangout.guests) {
						return false;
				}
				return hangout.guests.hasOwnProperty(guest.uid);
		}
    var exportAPI = {
        'items': hangoutsArray,
        addItem: function(data){
						var user = fbloginService.fbUserData.user;
            hangoutsArray.$add({
                'hostUid': data.hostUid,
                'hostPhotoURL': data.hostPhotoURL,
                'hangoutName': data.hangoutName,
                'hostName': user.displayName,
                'email': user.email,
                'phoneNumber': data.phoneNumber,
                'location': data.location,
                'hangoutDate': data.hangoutDate.getTime(),
                'hangoutStartTime': data.hangoutStartTime.getTime(),
                'hangoutEndTime': data.hangoutEndTime.getTime(),
                'description': data.description,
                'maxGuests': data.maxGuests,
                'postDateTime': firebase.database.ServerValue.TIMESTAMP
            });
        },
        delete: function(item){
            return hangoutsArray.$remove(item);
        },
				join: function(item) {
						var user = fbloginService.fbUserData.user;
						var currentUserGuestRef = hangoutsRef.child(item.$id + '/guests/' + user.uid);
						// Check whether current user is already in guest list
						if (isGuestOfHangout(item, user)) {
								console.debug('join: Guest is already part of the guest list, not doing anything');
								return false;
						}
						console.debug('join: Adding current user to guest list');
						return currentUserGuestRef.set({
								displayName: user.displayName,
								photoURL: user.photoURL,
								timestamp: firebase.database.ServerValue.TIMESTAMP
						});
				},
				leave: function(item) {
						var user = fbloginService.fbUserData.user;
						var currentUserGuestRef = hangoutsRef.child(item.$id + '/guests/' + user.uid);
						// Check whether current user is in guest list
						if (!isGuestOfHangout(item, user)) {
								console.debug('leave: Guest is NOT part of the guest list, not doing anything');
								return false;
						}
						console.debug('leave: Removing current user from guest list');
						return currentUserGuestRef.remove();
				}
    }
    return exportAPI;
}]);

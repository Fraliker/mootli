angular.module('hangouts', ['firebase'])

.service('Hangouts', ['$firebaseArray', 'fbloginService',
											function($firebaseArray, fbloginService){
    
    var ref = firebase.database().ref().child('hangouts');
    var items = $firebaseArray(ref);

		function isGuestOfHangout(hangout, guest) {
				console.debug('isGuestOfHangout(hangout, guest):', hangout, guest);
				if (!hangout.guests || !hangout.guests.length) {
					// undefined or length 0
						return false;
				}
				return hangout.guests.find(g => g.uid == guest.uid);
		}
    var hangouts = {
        'items': items,
        addItem: function(data){
            items.$add({
                'hostUid': data.hostUid,
                'hostPhotoURL': data.hostPhotoURL,
                'hangoutName': data.hangoutName,
                'hostName': data.hostName,
                'email': data.email,
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
            return items.$remove(item);
        },
				join: function(item) {
						var user = fbloginService.fbUserData.user;
						// We must be working with an object that's actually part of the firebaseArray
						console.assert(items.indexOf(item) != -1);
						// Check whether current user is already in guest list
						if (isGuestOfHangout(item, user)) {
								console.debug('join: Guest is already part of the guest list, not doing anything');
								return false;
						}
						console.debug('join: Adding current user to guest list');
						if (!item.guests) {
								item.guests = [];
						}
						item.guests.unshift({
								displayName: user.displayName,
								photoURL: user.photoURL,
								uid: user.uid
						});
						return items.$save(item);
				},
				leave: function(item) {
						var user = fbloginService.fbUserData.user;
						// We must be working with an object that's actually part of the firebaseArray
						console.assert(items.indexOf(item) != -1);
						console.assert(Array.isArray(item.guests));
						// Check whether current user is in guest list
						var guest = isGuestOfHangout(item, user);
						console.log('guest:', guest);
						if (!guest) {
								console.debug('leave: Guest is NOT part of the guest list, not doing anything');
								return false;
						}
						console.debug('leave: Removing current user from guest list');
						var i = item.guests.indexOf(guest);
						console.assert(i != -1);
						item.guests.splice(i, 1); 
						return items.$save(item);
				}
    }
    return hangouts;
}]);

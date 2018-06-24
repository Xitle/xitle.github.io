// alertify.alert('Alert Message!');

// var success = sessionStorage.getItem("success");
// if (success) {
//     sessionStorage.removeItem("success");
//     alertify.alert('Success', 'Your information has been submitted', function () {
//         location.reload();
//     });
// }

// if (exists) {
//     addUser(++userID);
// } else {
//     var fname = $('#fname').val();
//     var lname = $('#lname').val();

//     writeUserData(fname, lname, userID);
//     sessionStorage.setItem("success", "true");
//     location.reload();

// }
// console.log(userID);

$(document).ready(function () {

    checkIfLoggedIn();

    $('#add_user_btn').click(function (e) {
        e.preventDefault();
        // var firebaseRef = firebaseDB.ref();
        // firebaseRef.child("Text").set("Some Value");
        addUser();
    });

    $('#sign_in_btn').click(function (e) {
        e.preventDefault();
        login();
    });

    $('#sign_up_btn').click(function (e) {
        // e.preventDefault();
        validateSignUp();
        var allValid = true;
        var validField = $('.ui.form').form('is valid');
        validField.forEach(function (element) {
            if (element === false) {
                allValid = false;
            }
        });
        if (allValid) {
            signUp();
        }

    });

});

// Add User to firebase database
function addUser() {

    var usersRef = firebase.database().ref().child("users");
    var fname = $('#fname').val();
    var lname = $('#lname').val();

    usersRef.once('value', function (snapshot) {
        if (snapshot.val() === null) {
            var userID = 1;
            console.log(userID);
            writeUserData(fname, lname, userID);
        } else {
            // var exists = (snapshot.val() !== null);
            usersRef.limitToLast(1).once('child_added', function (snapshot) {
                var userID = snapshot.child('userID').val() + 1;
                console.log(userID);
                writeUserData(fname, lname, userID);
            });
        }
    });

    swal('Success', 'Successfully added.', 'success').then(function () {
        location.reload();
    });
}

//Login to firebase authentication
function login() {
    var email = $('input[name="email"].sign_in_field')[0].value;
    var password = $('input[name="password"].sign_in_field')[0].value;

    firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
        swal('Success', 'You are now logged in.', 'success').then(function () {
            $('.ui.modal').modal('hide');
        });
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        swal('Error', errorMessage, 'error');
    });

}

function signUp() {
    var email = $('input[name="email"].sign_up_field')[0].value;
    var password = $('input[name="password"].sign_up_field')[0].value;
    var cpassword = $('input[name="cpassword"].sign_up_field')[0].value;
    if (password === cpassword) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
            swal('Success', 'You are now registered.', 'success');
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            swal('Error', errorMessage, 'error');
        });
    } else {
        swal('Error', 'Password doesn\'t match.', 'error');
    }


}

function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        swal('Success', 'You are now logged out.', 'success').then(function () {
            $('.ui.modal').modal('hide');
        });
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        swal('Error', errorMessage, 'error');
    });
}

//Write user data
function writeUserData(fname, lname, userID) {

    firebase.database().ref('users').push({
        userID: userID,
        firstname: fname,
        lastname: lname
    });
}


// Tests to see if /users/<userID> has any data. 
function checkIfUserExists(userID) {

    var usersRef = firebase.database().ref().child("users");
    usersRef.child(userID).on('value', function (snapshot) {
        console.log(snapshot.val());
        exists = (snapshot.val() !== null);
    });
    console.log(exists);
}

function checkIfLoggedIn() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            if (!user.emailVerified) {
                $.ajax({
                    url: 'fragments/notVerified.html',
                    success: function (res) {
                        user.sendEmailVerification().then(function () {
                            //Email Sent
                            $('#navigation').html(res);
                            $('#verify').modal({
                                closable: false
                            }).modal('show');
                        }).catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            // ...
                            swal('Error', errorMessage, 'error');
                        });
                    }
                });
            } else {
                $.ajax({
                    url: 'fragments/userNav.html',
                    success: function (res) {
                        $('#navigation').html(res);

                        $('#add_user').click(function (e) {
                            e.preventDefault();
                            $('#add_user_modal').modal('show');
                        });


                        $('#sign_out').click(function (e) {
                            e.preventDefault();
                            signOut();
                        });

                    }
                });
            }
        } else {
            // No user is signed in.
            $.ajax({
                url: 'fragments/guestNav.html',
                success: function (res) {
                    $('#navigation').html(res);

                    $('#sign_in').click(function (e) {
                        e.preventDefault();
                        $('#sign_in_modal').modal('show');
                    });

                    $('#sign_up').click(function (e) {
                        e.preventDefault();
                        $('#sign_up_modal').modal('show');
                    });
                }
            });
        }
    });
}

function validateSignUp() {
    $('.ui.form.sign_up')
        .form({
            fields: {
                email: {
                    identifier: 'email',
                    rules: [{
                        type: 'email',
                        prompt: 'Please enter a valid email address (eg. name@sample.com).'
                    }]
                },
                password: {
                    identifier: 'password',
                    rules: [{
                        type: 'minLength[6]',
                        prompt: 'Your password must be at least {ruleValue} characters'
                    }]
                },
                cpassword: {
                    identifier: 'cpassword',
                    rules: [{
                        type: 'match[sign_up_pass]',
                        prompt: 'Password does not match.'
                    }]
                },
                terms: {
                    identifier: 'terms',
                    rules: [{
                        type: 'checked',
                        prompt: 'You must agree to the terms and conditions'
                    }]
                }
            },
            inline: true,
            onSuccess: function (e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
}
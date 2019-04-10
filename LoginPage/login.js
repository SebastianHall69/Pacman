//Global variables
var usernamePtrn = /^\w{1,16}$/;//Regex 1-16 alphanumerical exact match
var passwordPtrn = /^\w{4,16}$/;//Regex 4-16 alphanumerical exact match

//Displays login form
function showLogin() {
    document.getElementById("loginForm").style.display = "block";//Show login
    document.getElementById("signUpForm").style.display = "none";//Hide sign up
}

//Displays sign in form
function showSignUp() {
    document.getElementById("signUpForm").style.display = "block";//Show sign up
    document.getElementById("loginForm").style.display = "none";//Hide login
}

//Sets an error message in errMsg class elements
function setMsg(index, message) {
    document.getElementsByClassName("errMsg")[index].innerHTML = message;
}

function validateSignUp() {
    //Declare and initialize variables
    var username = document.forms["signUpForm"]["signUpUsername"].value;//Username
    var password1 = document.forms["signUpForm"]["signUpPassword"].value;//Password
    var password2 = document.forms["signUpForm"]["confirmPassword"].value;//Password confirm
    var errMsg = "";//An error message to display
    var isValid = true;//Status on submission validity
    var errSpans = document.getElementsByClassName("errMsg");//Array of error messsage spans
    
    //Clear away previous error messages if any
    for(var i = 0; i < errSpans.length; ++i) {
        errSpans[i].innerHTML = "";
    }
    //Validate username with regex
    if(!usernamePtrn.test(username)) {
        errMsg = "*1-16 alphanumerical char";
        setMsg(2, errMsg);
        isValid = false;
    }
    //Validate password with regex
    if(!passwordPtrn.test(password1)) {
        errMsg = "*4-16 alphanumerical char";//Set message string
        setMsg(3, errMsg);//Set error message
        isValid = false;//Set flag to false
        document.getElementById("signUpPassword").value = "";//Clear password
        document.getElementById("confirmPassword").value = "";//Clear password
    } else if(password1 !== password2) {//Else if passwords don't match
        errMsg = "*Passwords do not match";//Set message string
        setMsg(3, errMsg);//Set error message
        isValid = false;//Set flag
        document.getElementById("signUpPassword").value = "";//Clear password
        document.getElementById("confirmPassword").value = "";//Clear password
    }
    //Return isValid to continue or reenter input
    return isValid;
}

//Validates input for the login form
function validateLogin() {
    //Declare and initialize variables
    var username = document.forms["loginForm"]["loginUsername"].value;//Username
    var password = document.forms["loginForm"]["loginPassword"].value;//Password
    var errMsg = "";//Error message to output if errors
    var isValid = true;//Status on submission validity
    var errSpans = document.getElementsByClassName("errMsg");//Array of error message spans

    //Clear away previous error message if any
    for(var i = 0; i < errSpans.length; ++i) {
        errSpans[i].innerHTML = "";
    }

    //Check if username does not match pattern
    if(!usernamePtrn.test(username)) {
        errMsg = "*Invalid username";
        setMsg(0, errMsg);//Set error message by username
        isValid = false;
    }
    //Check if password does not match pattern
    if(!passwordPtrn.test(password)) {
        errMsg = "*Invalid password";
        setMsg(1, errMsg);
        document.getElementById("loginPassword").value = "";
        isValid = false;
    }

    //Return isValid to continue or reenter input
    return isValid;
}
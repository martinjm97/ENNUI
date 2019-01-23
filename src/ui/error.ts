
export function displayError(error: Error) {
    document.getElementById("error").style.display = null;
    document.getElementById("errorMessage").innerHTML = error.message;
    document.getElementById("error").title = error.message;
    throw error;
}    

export function displayError(error: Error): void {
    document.getElementById("error").style.display = null;
    document.getElementById("errorMessage").innerHTML = error.message;
    document.getElementById("error").title = error.message;
    throw error;
}

export function clearError(): void {
    document.getElementById("error").style.display = "none";
}

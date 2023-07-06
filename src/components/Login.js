import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Input from "./form/Input";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);
    const { setJwtToken } = useOutletContext();
    const { setAlertClassName } = useOutletContext();
    const { setAlertMessage } = useOutletContext();
    const { setJwtRefreshToken } = useOutletContext();

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // build the request payload
        let payload = {
            email: email,
            password: password,
        }

        const requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept':'*/*'
            },
            body: JSON.stringify(payload),
        }

        fetch(`${process.env.REACT_APP_BACKEND}/user/login`, requestOptions)
            .then((response) => {  
                if (response.status !== 200) {
                    setError("Invalid response code: " + response.status);
                }
                return response.json();})
            .then((respJson) => {
                if (respJson.error) {
                    setAlertClassName("alert-danger");
                    setAlertMessage(respJson.message);
                } else {
                    setJwtToken(respJson.data.token.access_token);
                    setJwtRefreshToken(respJson.data.refresh_token.access_token);
                    setAlertClassName("d-none");
                    setAlertMessage("");
                    navigate("/");
                }
            })
            .catch(error => {
                setAlertClassName("alert-danger");
                setAlertMessage(error);
            })
    }

    return(
        <div className="col-md-6 offset-md-3">
            <h2>Login</h2>
            <hr />

            <form onSubmit={handleSubmit}>
                <Input
                    title="Email Address"
                    type="email"
                    className="form-control"
                    name="email"
                    autoComplete="email-new"
                    onChange={(event) => setEmail(event.target.value)}
                />

                <Input
                    title="Password"
                    type="password"
                    className="form-control"
                    name="password"
                    autoComplete="password-new"
                    onChange={(event) => setPassword(event.target.value)}
                />

                <hr />

                <input 
                    type="submit"
                    className="btn btn-primary"
                    value="Login"
                />


            </form>
        </div>
    )
}

export default Login;
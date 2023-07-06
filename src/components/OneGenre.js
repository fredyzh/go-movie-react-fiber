import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useOutletContext } from "react-router-dom"


const OneGenre = () => {
    // we need to get the "prop" passed to this component
    const location = useLocation();
    const { genreName } = location.state;
    const { setAlertClassName } = useOutletContext();
    const { setAlertMessage } = useOutletContext();
    setAlertClassName("d-none");
    setAlertMessage("");

    // set stateful variables
    const [movies, setMovies] = useState([]);

    // get the id from the url
    let { id } = useParams();

    // useEffect to get list of movies
    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json")
        
        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`${process.env.REACT_APP_BACKEND}/genres/${id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlertClassName("alert-danger");
                    setAlertMessage(data.error);
                } else {
                    setMovies(data);
                }
            })
            .catch(err => {
                setAlertClassName("alert-danger");
                setAlertMessage(err);});
    }, [id])

    // return jsx
    return (
        <>
            <h2>Genre: {genreName}</h2>

            <hr />

            {movies ? (
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Movie</th>
                        <th>Release Date</th>
                        <th>Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((m) => (
                        <tr key={m.id}>
                            <td>
                                <Link to={`/movies/${m.id}`}>
                                    {m.title}
                                </Link>
                            </td>
                            <td>{m.release_date}</td>
                            <td>{m.mpaa_rating}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            ) : (
                <p>No movies in this genre (yet)!</p>
            )}
        </>
    )
}

export default OneGenre;
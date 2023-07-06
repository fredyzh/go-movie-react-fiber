import { Link, useOutletContext } from "react-router-dom";
import Ticket from "./../images/movie_tickets.jpg";

const Home = () => {
  const { setAlertClassName } = useOutletContext();
  const { setAlertMessage } = useOutletContext();
  setAlertClassName("d-none");
  setAlertMessage("");

  return (
    <>
      <div className="text-center">
        <h2>Find a movie to watch tonight!</h2>
        <hr />
        <Link to="/movies">
          <img src={Ticket} alt="movie tickets"></img>
        </Link>
      </div>
    </>
  );
};

export default Home;

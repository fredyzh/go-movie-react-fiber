import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import Input from "./form/Input"
import Select from "./form/Select"
import TextArea from "./form/TextArea"
import Checkbox from "./form/Checkbox";
import Swal  from "sweetalert2"

const EditMovie=()=>{
    const navigate=useNavigate();
    const{jwtToken}=useOutletContext();
    const{jwtRefreshToken}=useOutletContext();
    const[error, setError]=useState(null);
    const[errors, setErrors] =useState([]);
    const { setAlertClassName } = useOutletContext();
    const { setAlertMessage } = useOutletContext();
    setAlertClassName("d-none");
    setAlertMessage("");

    
    const mpaaOptions=[
        {id: "G", value:"G"},
        {id: "PG", value:"GP"},
        {id: "PG13", value:"PG13"},
        {id: "R", value:"R"},
        {id: "NC17", value:"NC17"},
        {id: "18A", value:"18A"},
    ]

    const hasError=(key)=>{
        return errors.indexOf(key)!==-1;
    }

    const[movieGenres, setMovieGenres]=useState({movie:{
      id:0,
      title:"",
      release_date:"",
      runtime:"",
      mpaa_rating:"",
      description:""
      },
      genres:[]
  });

    let{id}=useParams();
    if (id===undefined){
        id=0;
    }

    useEffect(()=>{
        if (jwtToken===undefined || jwtToken==="" ){
            navigate("/login");
            return;
        }

        if (id===0){
            //add 
            setMovieGenres({
              movie:{
                id:0,
                title:"",
                release_date:"",
                runtime:"",
                mpaa_rating:"",
                description:""
                },
                genres:[]
            })

            const headers=new Headers();
            headers.append("Content-Type", "application/json")
            
            const requestOptions={
                method:"GET",
                headers:headers,
            }
    
            fetch(`${process.env.REACT_APP_BACKEND}/genres`, requestOptions)
                .then((response)=> response.json())
                .then((data)=> {
                    const checks=[];

                    data.forEach(g => {
                        checks.push({
                            id:g.id,
                            checked:false,
                            genre: g.genre,
                        });
                    })

                    setMovieGenres(m=>({
                        ...m,
                        genres:checks,
                    }))
                })
                .catch(err=>{
                    setAlertClassName("alert-danger");
                    setAlertMessage(err);
                })
        }else{
            //edit
            const headers=new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", "Bearer "+jwtToken);
            headers.append("X-CSRF-Token", jwtRefreshToken);
            const requestOptions={
                method:"GET",
                headers:headers,
            }
            
            fetch(`${process.env.REACT_APP_BACKEND}/admin/movies/${id}`, requestOptions)
            .then((response)=> {
                if(response.status !==200){
                    setError("Invalid response code: "+response.status)
                }
                return response.json();
            })
            .then((data)=> {
                data.movie.release_date=new Date(data.movie.release_date).toISOString().split('T')[0];
                setMovieGenres({
                    movie:data.movie,
                    genres:data.genres,
                })
            })
            .catch(err=>{
                setAlertClassName("alert-danger");
                setAlertMessage(err);
            })
        }

    }, [id, jwtToken, navigate])

    const handleSubmit=(event)=>{
        event.preventDefault();
        
        let errors=[];
        let required=[
            {field:movieGenres.movie.title, name:"title"},
            {field:movieGenres.movie.release_date, name:"release_date"},
            {field:movieGenres.movie.runtime, name:"runtime"},
            {field:movieGenres.movie.description, name:"description"},
            {field:movieGenres.movie.mpaa_rating, name:"mpaa_rating"},
        ]

        required.forEach(function (obj){
            if (obj.field==="" || obj.field===undefined){
                errors.push(obj.name);
            }
        })
        
        if(movieGenres.genres.length===0){
            Swal.fire({
                title: 'Error!',
                text:'You must choose at least one genre',
                icon:'error',
                confirmButtonText:'OK',
            });
            errors.push("genres");
        }

        setErrors(errors);
        
        if (errors.length>0){
            return false
        }

        movieGenres.movie.release_date=new Date(movieGenres.movie.release_date)
        movieGenres.movie.runtime=parseInt(movieGenres.movie.runtime, 10)

        let backMethod="PUT";

        if (movieGenres.movie.id > 0) {
            backMethod = "PATCH";
        }

        const requestOptions={
            method: backMethod,
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json',
                "Authorization": "Bearer " + jwtToken,
                "X-CSRF-Token":jwtRefreshToken,
            },
            // credentials: "include",
            body:JSON.stringify(movieGenres),
        }

        fetch(`${process.env.REACT_APP_BACKEND}/admin/movies/${movieGenres.movie.id}`, requestOptions)
            .then((response)=> response.json())
            .then((data)=> {
                if (data.error) {
                    setAlertClassName("alert-danger");
                    setAlertMessage(data.error);
                } else {
                    setAlertClassName("alert-success");
                    setAlertMessage(data.message);
                    navigate("/manage-catalogue");
                }
            })
            .catch(err=>{
                setAlertClassName("alert-danger");
                setAlertMessage(err);
            })
    }

    const handleChange=()=>(event)=>{
        let value=event.target.value;
        let name=event.target.name;

        if (name===`mpaa_rating`){
            movieGenres.movie.mpaa_rating=value
        }

        setMovieGenres({
            movie:{
                ...movieGenres.movie,
                [name]:value,
            },
            genres:movieGenres.genres,
        })
    }

    const handleCheck=(event, postion)=>{
        movieGenres.genres[postion].checked=!movieGenres.genres[postion].checked

        setMovieGenres({
            movie:movieGenres.movie,
            genres:movieGenres.genres
        })
    }

    const confirmDelete = () => {
        Swal.fire({
            title: 'Delete movie?',
            text: "You cannot undo this action!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {
                let headers = new Headers();
                headers.append("Authorization", "Bearer " + jwtToken);
                headers.append("X-CSRF-Token", jwtRefreshToken);
    
                const requestOptions = {
                    method: "DELETE",
                    headers: headers,
                };
    
              fetch(`${process.env.REACT_APP_BACKEND}/admin/movies/${movieGenres.movie.id}`, requestOptions)
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        setAlertClassName("alert-danger");
                            setAlertMessage(data.error);
                    } else {
                        setAlertClassName("alert-success");
                        setAlertMessage(data.message);
                        navigate("/manage-catalogue");
                    }
                })
                .catch(err => {setAlertClassName("alert-danger");
                                setAlertMessage(err);});
            }
          })
    }

    if (error !== null) {
        return <div>Error: {error.message}</div>;
      } else {
    return(
        <div>
            <h2>Add/EditMovie</h2>
            <hr />
            <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={movieGenres.movie.id} id="id"></input>

                <Input 
                    title={"Title"}
                    className={"form-control"}
                    type={"text"}
                    name={"title"}
                    value={movieGenres.movie.title}
                    onChange={handleChange("title")}
                    errorDiv={hasError("title")? "text-danger":"d-none"}
                    errorMsg={"please enter a title"}
                />

                <Input 
                    title={"Release Date"}
                    className={"form-control"}
                    type={"date"}
                    name={"release_date"}
                    value={movieGenres.movie.release_date}
                    onChange={handleChange("release_date")}
                    errorDiv={hasError("release_date")? "text-danger":"d-none"}
                    errorMsg={"please enter a release date"}
                />

                <Input 
                    title={"Run Time"}
                    className={"form-control"}
                    type={"text"}
                    name={"runtime"}
                    value={movieGenres.movie.runtime}
                    onChange={handleChange("runtime")}
                    errorDiv={hasError("runtime")? "text-danger":"d-none"}
                    errorMsg={"please enter a runtime"}
                />
                <Select
                    title={"MPAA Rating"}
                    name={"mpaa_rating"}
                    options={mpaaOptions}
                    value={movieGenres.movie.mpaa_rating}
                    onChange={handleChange("mpaa_rating")}
                    placeHolder={"Choose..."}
                    errorMsg={"please choose"}
                    errorDiv={hasError("mpaa_rating")? "text-danger":"d-none"}
                />

                <TextArea 
                    title={"Description"}
                    className={"form-control"}
                    name={"description"}
                    value={movieGenres.movie.description}
                    rows={"3"}
                    onChange={handleChange("description")}
                    errorDiv={hasError("description")? "text-danger":"d-none"}
                    errorMsg={"please enter a description"}
                />
                <hr />
                <h3>Genres</h3>

                {movieGenres.genres && movieGenres.genres.length>1 &&
                    <>
                        {Array.from(movieGenres.genres).map((g, index)=>
                            <Checkbox 
                                title={g.genre}
                                name={"genre"}
                                key={index}
                                id={"genre-"+index}
                                onChange={(event)=>handleCheck(event, index)}
                                value={g.id}
                                checked={g.checked}
                            />
                        )}
                    </>
                }
                <hr />

                <button className="btn btn-primary">Save</button>
                {movieGenres.movie.id > 0 && (
                    <a href="#!" className="btn btn-danger ms-2" onClick={confirmDelete}>
                    Delete Movie
                    </a>
                )}
            </form>
        </div>
    )
    }
}

export default EditMovie
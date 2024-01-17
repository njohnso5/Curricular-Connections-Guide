import "../css/UserMenu.css"

function UserMenu() {

  

  return (
    <div className="btn-group" id="user-menu">
      <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
      M.W.
      <span className="caret"></span>
      </button>
      <ul className="dropdown-menu pull-right" role="menu">
        <li><span id="profile-name">Ms. Wuf</span></li>
        <li className="divider"></li>
        <li><a href="#">Manage Courses</a></li>
        <li><a href="#">Manage Programs</a></li>
        <li><a href="#">Manage Users <span className="badge">2 Requests</span></a></li>
        <li><a href="#">User Guide</a></li>
        <li><a href="#">Site Dashboard</a></li>
        <li><a href="#">Logout</a></li>
      </ul>
    </div>
  );
}

export default UserMenu;
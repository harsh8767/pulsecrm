function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function Avatar({ name, id }) {
  return <span className={`avatar avatar-${id % 5}`}>{getInitials(name)}</span>;
}

export default Avatar;
// testing to understand render prop

// isLoading is boolean
const Button = ({ isLoading }) => {
  return <button>Submit {isLoading ? <Loading /> : null}</button>;
};

// ----
// icon is react functional component
const Button = ({ icon }) => {
  return <button>Submit {icon}</button>;
};
// usage of Button
<>
  // default Loading icon
  <Button icon={<Loading />} />
  // red Error icon
  <Button icon={<Error color="red" />} />
  // yellow large Warning icon
  <Button icon={<Warning color="yellow" size="large" />} />
  // avatar instead of icon
  <Button icon={<Avatar />} />
</>;

// ------
// instead of "icon" that expects an Element
// we're receiving a function that returns an Element
const Button = ({ renderIcon }) => {
  // and then just calling this function where the icon should be
  rendered;
  return <button>Submit {renderIcon()}</button>;
};
<Button renderIcon={() => <HomeIcon />} />;

// --
const Button = ({ appearance, size, renderIcon }) => {
  // create default props as before
  const defaultIconProps = {
    size: size === "large" ? "large" : "medium",
    color: appearance === "primary" ? "white" : "black",
  };
  // and just pass them to the function
  return <button>Submit {renderIcon(defaultIconProps)}</button>;
};
<Button renderIcon={(props) => <HomeIcon {...props} />} />;
<Button
  renderIcon={(props) => <HomeIcon {...props} size="large" color="red" />}
/>;
<Button
  renderIcon={(props) => (
    <HomeIcon fontSize={props.size} style={{ color: props.color }} />
  )}
/>;

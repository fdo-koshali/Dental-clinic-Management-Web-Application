// Import PropTypes for props validation
import PropTypes from "prop-types";

// TopBar component - Displays the current topic/section name at the top of the page
// @param {string} topic - The current active topic to display
const TopBar = ({ topic }) => {
  return (

    // Container with dark gray background
    <div className="bg-zinc-500 ">
    {/* Topic text with padding, large size, bold weight, and white color */}
      <p className="pt-3 pb-3 pl-3 text-2xl font-bold text-white">{topic}</p>
    </div>
  );
};

// PropTypes validation for the TopBar component
TopBar.propTypes = {
  topic: PropTypes.string,
};

// Export the TopBar component for use in other parts of the application
export default TopBar;

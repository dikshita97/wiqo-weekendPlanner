// Redirect legacy index — Wiqo lives at "/"
import { Navigate } from "react-router-dom";
const Index = () => <Navigate to="/" replace />;
export default Index;

export const metadata = {
  title: 'Admin Dashboard - Diamond Nursery',
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-root-wrapper">
      {children}
    </div>
  );
}

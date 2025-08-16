const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center">
            {children}
        </div>
    );
};

export default Layout;
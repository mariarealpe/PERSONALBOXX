export default function GuestLayout({ children }) {
    return (
        <>
            {children}
            <style jsx global>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    background: #000000;
                    overflow-x: hidden;
                }

                #app {
                    min-height: 100vh;
                    background: #000000;
                }
            `}</style>
        </>
    );
}



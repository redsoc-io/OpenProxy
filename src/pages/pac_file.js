import Nav from '../components/Nav';

export default function PacFile() {
    return (
        <div>
            <Nav />
            <div className='text-center py-3'>
                <h1 className='text-3xl font-black py-12'>Proxy Auto Configuration (PAC) File</h1>
            </div>
            <div className='p-4 flex items-center justify-center w-full'>
                <div className='w-auto mr-4 font-bold'>PAC URL </div>
                <div className='w-3/4'>
                    <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-4 py-2'
                        readOnly
                        value="https://oproxy.ml/api/proxy.pac"
                    />
                </div>
            </div>
            <div className='p-4 flex items-center justify-center w-full'>
            </div>
            <div className='p-4 flex items-center justify-center w-full'>
                <div>
                    <h2 className='font-bold text-xl mb-3'>Note</h2>
                    <p>
                        * PAC files are used to configure the proxy settings for a web browser.
                    </p>
                    <p>
                        * OProxy PAC file is a simple JavaScript file that returns a proxy configuration for the browser.
                    </p>
                    <p>
                        * You will receive the best server configuration from the proxy list.
                    </p>
                    <p>
                        * This OProxy PAC file is currently a work in progress.
                    </p>
                    <p>
                        <a
                            href="https://www.websense.com/content/support/library/web/v76/pac_file_best_practices/PAC_explained.aspx#:~:text=PAC%20files%20are%20used%20to,easy%20to%20create%20and%20maintain."
                            target={"_blank"}
                            className="hover:text-blue-700"
                        >
                            * Click here for more info about PAC Files
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
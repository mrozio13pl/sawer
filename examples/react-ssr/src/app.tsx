import ky, { HTTPError } from 'ky';
import { useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const defaultCode = `import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.listen(3000);`;

export function App() {
    const codeRef = useRef<HTMLTextAreaElement>(null);
    const langRef = useRef<HTMLInputElement>(null);
    const themeRef = useRef<HTMLInputElement>(null);
    const [code, setCode] = useState<string>();

    async function submit() {
        const code = codeRef.current!.value;
        const lang = langRef.current!.value;
        const theme = themeRef.current!.value;
        const options = { lang, theme, code };
        try {
            const res = await ky.post('http://localhost:3000/api/react', {
                body: JSON.stringify(options),
            });
            setCode(await res.text());
        } catch (error) {
            toast.error('Something went wrong!');
            if (error instanceof HTTPError) {
                console.error(await error.response.json());
            }
        }
    }

    return (
        <div className="min-w-screen min-h-screen flex justify-center items-center">
            <Toaster />
            <div className="w-2/3 flex flex-col justify-center items-center gap-2">
                <input type="text" placeholder="Language..." className="w-1/2" defaultValue="ts" ref={langRef} />
                <input type="text" placeholder="Theme name..." className="w-1/2" defaultValue="github-dark" ref={themeRef} />
                <textarea placeholder="Type your code here..." className="w-1/2 h-20" defaultValue={defaultCode} ref={codeRef} />
                <button onClick={submit}>Submit</button>
                {code && <div className="p-2" dangerouslySetInnerHTML={{ __html: code }} />}
            </div>
        </div>
    );
}

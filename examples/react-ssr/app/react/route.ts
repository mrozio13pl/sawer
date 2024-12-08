import { codeToHtml, bundledThemes } from 'shiki'; // 8.76 MB
import { z } from 'zod';
import type { Request, Response } from 'sawer';

const themes = Object.keys(bundledThemes) as any;
const schema = z.object({
    code: z.string().max(1000).default('console.log("Hello, world!");'),
    theme: z.enum(themes).default('github-dark'),
    lang: z.string().optional().default('ts'),
});

export async function POST(req: Request, res: Response) {
    const json = await req.json();

    const { error, data, success } = schema.safeParse(json);

    if (!success) {
        res.statusCode = 400;
        res.json(error);
        return;
    }

    const { code, theme, lang } = data!;

    const html = await codeToHtml(code, {
        lang,
        theme,
    });

    res.end(html);
}

Rule: Searching for multiple patterns in a single file

DO NOT use the grep `- flag when searching within a single file, and DO NOT pipe the output to `cat`. Also, avoid escaping pipes (\|) for basic OR operations. 
❌ Incorrect: `grep -r "pattern1\|pattern2" path/to/file.css | cat`


INSTEAD, use `grep - (Extended Regular Expressions) without the recursive flag and without piping to `cat`. 
✅ Correct: `grep -E "container|wrapper|padding|margin" styles/testimonials.css`
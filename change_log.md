## Change log

**2024-06-07**
1. **Optimize the OpenAPI validation** performed in the Protocol Server. The new code loads the validation tree once and uses the same tree to validate requests. This code has been contributed by Shiva Rakshith and others from ONEST team and is a part of the code change listed in this [PR](https://github.com/beckn/protocol-server/pull/158). This optimization primarily benefits network participants who deal with a single domain. 

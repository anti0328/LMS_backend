const fetch = require('node-fetch');

const canvasInstance = 'k12.instructure.com';
// const accessToken = '6936~TpgfnRxok6isETnVGDOyqKOmyZAqm0jP2qtO7BakB38czqCoT6AKUuTP0SqNOtQu';
const accessToken = '6936~qSFOAGSTIS65FuZtfw5q9OT88CIcauImi1NMifOjtJagUklzXhBBcQjLA7fXRSN5';
const apiUrl = `https://${canvasInstance}/api/v1/courses?per_page=9`;

const getCourses = async (req, res) => {
    // let tmp = []
    await getAllCourses(apiUrl + `&page=${req.query.pageNum}`).then(async courses => {
        if (courses) {
            for (var i = 0; i < courses.length; i++) {
                courses[i].progress = await getProgressById(courses[i].id)
            }

        }
        res.send(courses)
    });

};

const getProgressById = async (courseId) => {
    const url = `https://${canvasInstance}/api/v1/courses/${courseId}/assignments`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json'
        },
    };

    try {
        const response = await fetch(url, options);
        const assignments = await response.json();
        const totalAssignments = assignments.length;
        const publishedAssignments = await assignments.filter(assignment => assignment.published).length;
        let rlt = publishedAssignments / totalAssignments * 100;
        return rlt;
    } catch (error) {
        console.error('Failed to retrieve assignments:', error);
    }
}

async function fetchModules(courseId) {
    const url = `https://${canvasInstance}/api/v1/courses/${courseId}/modules`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error('Failed to fetch modules');
    }
    return response.json();
}

const fetchModuleItems = async (courseId, moduleId) => {
    const url = `https://${canvasInstance}/api/v1/courses/${courseId}/modules/${moduleId}/items`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`Failed to fetch module items for module ${moduleId}`);
    }
    return response.json();
}


const getContentById = async (req, res) => {
    try {
        const modules = await fetchModules(req.query.course_id);
        for (var i = 0; i < modules.length; i++) {
            // await console.log(`Module: ${modules[i].name}`);
            const items = await fetchModuleItems(req.query.course_id, modules[i].id);
            modules[i].lessons = await items;
        }

        res.send(modules)
    } catch (error) {
        console.error(error);
    }
};


async function getAllCourses(url, allCourses = []) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const courses = await response.json();
        // allCourses.push(...courses);

        // const linkHeader = response.headers.get('link');
        // const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));

        // if (nextLink) {
        //     const nextUrl = nextLink.split(';')[0].slice(1, -1);
        //     return getAllCourses(nextUrl, allCourses);
        // }

        return courses;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
    }
}

const getTotal = async (req, res) => {
    const count = await getTotalCount(`https://${canvasInstance}/api/v1/courses?per_page=100`);
    res.send({ count })
}

async function getTotalCount(url, allCourses = []) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const courses = await response.json();
        allCourses.push(...courses);

        const linkHeader = response.headers.get('link');
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));

        if (nextLink) {
            const nextUrl = nextLink.split(';')[0].slice(1, -1);
            return getTotalCount(nextUrl, allCourses);
        }

        return allCourses.length;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
    }
}



module.exports = {
    getCourses,
    getContentById,
    getTotal
    // getMyCourses
}

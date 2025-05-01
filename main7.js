
document.addEventListener('DOMContentLoaded', function () {
  // let shows; 
  let links; 
  // Load your JSON data
  d3.json('shows.json').then(data => {
    shows = data;
    links = data.links;
    // SVG container
    width = 800;
    height = 800;
    // showNodeColor = '#69f0ae';
    showNodeColor = '#3cb371';
    actorNodeColor = '#1E90FF';
    linkColor = '#808080';
    const svg = d3.select('body').append('svg')
      // .attr('width', 800)
      // .attr('height', 600)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2.5, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

      // .attr('width', window.innerWidth)
      // .attr('height', window.innerHeight);

    // force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.name).distance(25)) // Adjust distance as needed
      // .force('charge', d3.forceManyBody().strength(-50)) // Adjust strength as needed
      .force('charge', d3.forceManyBody().strength(node => (node.type === 'TV Show' ? -12 : -9))) // Adjust the strength values
      // .force('center', d3.forceCenter(400, 300)) // Adjust center coordinates as needed
      .force('center', d3.forceCenter(0, 0)) // Adjust center coordinates as needed
      // .force('link', d3.forceLink().id(d => d.name))
      // .force('charge', d3.forceManyBody())
      // .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force('x', d3.forceX().x(window.innerWidth / 2)) // Keep nodes attracted to the center horizontally
      .force('y', d3.forceY().y(window.innerHeight / 2)); // Keep nodes attracted to the center vertically

    // circular layout
    const nodes = data.nodes.map((node, index) => ({
      ...node,
      // x: Math.cos((2 * Math.PI * index) / data.nodes.length) * 200 + window.innerWidth / 2,
      // y: Math.sin((2 * Math.PI * index) / data.nodes.length) * 200 + window.innerHeight / 2,
      x: Math.cos((2 * Math.PI * index) / data.nodes.length) * (width / 4),
      y: Math.sin((2 * Math.PI * index) / data.nodes.length) * (height / 4),
      // x: Math.cos((2 * Math.PI * index) / data.nodes.length) * (window.innerWidth / 3) + window.innerWidth / 2,
      // y: Math.sin((2 * Math.PI * index) / data.nodes.length) * (window.innerHeight / 3) + window.innerHeight / 2,
    }));

    // Add links and nodes to simulation
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .style('stroke',linkColor)
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      // .attr('r', 10) // Adjust the radius as needed
      .attr('r', d => d.type === 'TV Show' ? 5.5 : 3) // Adjust the radius based on type
      .attr('fill', d => d.type === 'TV Show' ? showNodeColor : actorNodeColor) // Adjust colors based on type
      .attr('data-name', d => d.name); 

    simulation
      .nodes(nodes)
      .on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });

    simulation.force('link')
      .links(data.links);

    // Add hover and click events
    node.on('mouseout', handleMouseOut)
    // .on('mouseover', handleMouseOver)
    // .on('click', handleClick);
    node.on('mouseover', function(event, d) {
      handleMouseOver.call(this, event, d);
    });
    node.on('click', function(event, d) {
      handleClick(event, d);
      // console.log('Node clicked:', d);
    });

    // Legend 
    const legendContainer = d3.select('#legend-container');

    const legend = legendContainer.append('div')
      .attr('id', 'legend')
      .style('text-align', 'center');

    const legendTVShow = legend.append('div')
      .style('display', 'inline-block')
      .style('margin-right', '20px');

    legendTVShow.append('div')
      .style('width', '12px')
      .style('height', '12px')
      .style('background-color', showNodeColor)
      .style('border-radius', '50%') // Use border-radius for circles
      .style('display', 'inline-block');

    legendTVShow.append('span')
      .style('font-weight', 'bold')
      .style('font-size', '15px')
      .text(' TV Show');

    const legendCast = legend.append('div')
      .style('display', 'inline-block')
      .style('margin-right', '20px');

    legendCast.append('div')
      .style('width', '8px')
      .style('height', '8px')
      .style('background-color', actorNodeColor)
      .style('border-radius', '50%') 
      .style('display', 'inline-block');

    legendCast.append('span')
      .style('font-weight', 'bold')
      .style('font-size', '15px')
      .text(' Cast');

    const legendLine = legend.append('hr')
      // .style('border-color', '#ccc')
      .style('width', '25px')
      .style('height', '1.5px')
      .style('background-color', linkColor)
      .style('vertical-align', 'middle') 
      .style('display', 'inline-block');

    const legendActedIn = legend.append('div')
      .style('display', 'inline-block');

    legendActedIn.append('span')
      .style('font-weight', 'bold')
      .style('font-size', '15px')
      .text(' Acted in');

    // TV show names and actor names
    const allNames = data.nodes.map(node => node.name);
    const specialCases = ['#blackAF', '(Un)Well'];
    const uniqueNames = [...new Set(allNames)].sort((a, b) => {
      const indexA = specialCases.indexOf(a);
      const indexB = specialCases.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        // If both names are special cases, use predefined order
        return indexA - indexB;
      } else if (indexA !== -1) {
        // If only A is a special case, place it before B
        return -1;
      } else if (indexB !== -1) {
        // If only B is a special case, place it before A
        return 1;
      } else {
        // Otherwise, use standard alphabetical sorting
        return a.toLowerCase().localeCompare(b.toLowerCase());
      }
    });

    // Populate the datalist with unique names
    const datalist = d3.select('#searches');
    uniqueNames.forEach(name => {
      datalist.append('option').attr('value', name);
    });

    // Create a mapping between lowercase names and original case names
    const nameMapping = {};
    allNames.forEach(name => {
      const lowercaseName = name.toLowerCase();
      nameMapping[lowercaseName] = name;
    });

    // Add a click event listener for search results
    const searchInput = d3.select('#search-bar-choices');
      searchInput.on('change', function () {
        const selectedLowercaseName = this.value.toLowerCase();

        // Reset styles on click
        node.attr('stroke', null).attr('stroke-width', null);
        d3.select('#hover-label').remove();

        // // Hide Detail Info Card
        // const detailInfoCard = d3.select('#detail-info-card');
        // detailInfoCard.style('display', 'none');

        // Fade out all nodes and links
        node.style('opacity', .1);
        link.style('opacity', .1);
        // Find the corresponding node in the data
        const selectedNode = nodes.find(node => node.name.toLowerCase() === selectedLowercaseName);

    //   // Trigger highlighting for the selected node
    //   highlightNode(selectedNode);
    // });

    // function highlightNode(selectedNode) {
    // Reset styles
    // node.style('opacity', 1);
    // link.style('opacity', 1);
    // node.attr('stroke', null).attr('stroke-width', null); // Reset stroke for all nodes

    // Check if selectedNode is defined
    if (selectedNode) {
      // Highlight the selected node with a stroke
      // const selectedCircle = 
      d3.select(`circle[data-name="${selectedNode.name}"]`)
      // selectedCircle
        .style('opacity', 1)
        // node.style('opacity', 1)
        // link.style('opacity', 1)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      // Highlight connected nodes with a stroke
      link.filter(link => link.source === selectedNode || link.target === selectedNode)
        .each(function (linkData) {
          d3.select(`circle[data-name="${linkData.source.name}"]`)
            .style('opacity', 1)
            // .attr('stroke', 'black')
            // .attr('stroke-width', 2);
            .classed('connected-node', true);

          d3.select(`circle[data-name="${linkData.target.name}"]`)
            .style('opacity', 1)
            // .attr('stroke', 'black')
            // .attr('stroke-width', 2);
            .classed('connected-node', true);
          d3.select(this) // Highlight the link
            .style('opacity', 1)
            .classed('connected-link', true);
        });

      // Display text label with TV Show/Cast name
      svg.append('text')
        .attr('id', 'hover-label')
        // .attr('x', selectedCircle.attr('cx'))
        // .attr('y', selectedCircle.attr('cy') - 15)
        .attr('x', selectedNode.x)
        .attr('y', selectedNode.y - 15)
        .text(selectedNode.name)
        .style('text-color', '#808080');

      // // Update and display Detail Info Card
      // updateDetailInfoCard(selectedNode);
    }
  });

    function areNodesConnected(hoveredNode, otherNode) {
      // Check if two nodes are connected, excluding the hovered node
      return links.some(link =>
        ((link.source === hoveredNode && link.target === otherNode) ||
          (link.source === otherNode && link.target === hoveredNode)) &&
        hoveredNode !== otherNode
      );
    }

//     // Function to update and display Detail Info Card
//     function updateDetailInfoCard(selectedNode) {
//       // Check if it's an actor or TV show
//       const infoCard = d3.select('#detail-info-card');

//       if (d.type === 'Actor') {
//           // If the node is an actor
//           const tvShows = d.tvshows.join(', ');
//           infoCard.html(`
//               <p style="font-size: 18px; font-weight: bold; max-width: 300px;">${d.name}</p>
//               <hr style="margin: 5px 0;">
//               <p style="font-weight: bold; max-width: 300px;">TV Show(s):</p>
//               <p style="max-width: 300px;">${tvShows}</p>
//           `)
//           .style('position', 'absolute')
//           .style('left', '65%');
//       } else if (d.type === 'TV Show') {
//           // If it's a TV show, show TV show-related information
//           const castList = d.cast.split(', ').join(', '); // Assuming cast is a comma-separated string
//           infoCard.html(`<p style="font-weight: bold; font-size: 16px; max-width: 300px;">${d.name}</p><hr>
//               <p style="max-width: 300px;"><strong>Cast:</strong> ${castList}</p>
//               <p style="max-width: 300px;"><strong>Genre:</strong> ${d.genre}</p>
//               <p style="max-width: 300px;"><strong>Plot:</strong> ${d.description}</p>`)
//               .style('position', 'absolute')
//               .style('left', '65%');
//         }
//       // Display the Detail Info Card
//       infoCard.style('display', 'block');
// }

    function handleMouseOver(event, d) {
      // Implement hover logic
      // Highlight the hovered node
      d3.select(this).attr('stroke', 'black').attr('stroke-width', 2);

      // Display text label with TV Show/Cast name
      svg.append('text')
        .attr('id', 'hover-label')
        .attr('x', d.x)
        .attr('y', d.y - 15)
        .text(d.name);

      // // Bring immediate neighbors into focus
      // link.style('stroke', linkColor); // Reset link colors
      // link.filter(link => link.source === d || link.target === d)
      //   .style('stroke', 'red'); // Highlight links connected to the hovered node

      // Fade out other nodes and links, but not the connected nodes and links
      node.style('opacity', node => areNodesConnected(d, node) ? 1 : 0.1)
        .filter(node => node === d)
        .style('opacity', 1);
    
      link.style('opacity', link => link.source === d || link.target === d ? 1 : 0.1);

      // Highlight connected nodes with a stroke
      link.filter(link => link.source === d || link.target === d)
        .each(function (linkData) {
          d3.select(`circle[data-name="${linkData.source.name}"]`)
            .classed('connected-node', true);

          d3.select(`circle[data-name="${linkData.target.name}"]`)
            .classed('connected-node', true);
        });

      // Display Detail Info Card
      const detailInfoCard = d3.select('#detail-info-card');

      if (d.type === 'Actor') {
          // If the node is an actor
          const tvShows = d.tvshows.join(', ');
          detailInfoCard.html(`
              <p class="title" style="font-size: 25px; font-weight: bold; max-width: 400px;">${d.name}</p>
              <hr style="margin: 5px 0, width: 60; background-color #fffff0;">
              <p class="subtitle" style="font-size: 14px; line-height: 1.5; max-width: 400px;"><strong>TV Show(s):</strong> ${tvShows}</p>
          `)
          .style('position', 'absolute')
          .style('left', '65%');
      } else if (d.type === 'TV Show') {
          // If it's a TV show, show TV show-related information
          const castList = d.cast.split(', ').join(', '); // Assuming cast is a comma-separated string
          detailInfoCard.html(`<p class="title" style="font-weight: bold; font-size: 25px; max-width: 325px;">${d.name}</p><hr>
              <p class="subtitle" style="font-size: 14px; line-height: 1.5; max-width: 325px;"><strong>Cast:</strong> ${castList}</p>
              <p class="subtitle" style="font-size: 14px; line-height: 1.5; max-width: 325px;"><strong>Genre:</strong> ${d.genre}</p>
              <p class="subtitle" style="font-size: 14px; line-height: 1.5; max-width: 325px;"><strong>Plot:</strong> ${d.description}</p>`)
              .style('position', 'absolute')
              .style('left', '65%');
        }
    }

    function handleMouseOut(event, d) {
      // Implement mouseout logic
      // Reset styles on mouse out
      // d3.select(this).attr('stroke', null).attr('stroke-width', null);
      // d3.select('#hover-label').remove();
      // link.style('stroke', linkColor); // Reset link colors
      d3.select(this).attr('stroke', null).attr('stroke-width', null);
      d3.select('#hover-label').remove();

      node.classed('connected-node', false);
      // Fade in all nodes and links
      // node.transition().style('opacity', 1);
      // link.transition().style('opacity', 1);
      node.style('opacity', 1);
      link.style('opacity', 1);

      // detailInfoCard.style('display', 'none');
    }

    function handleClick(event, d) {
      // Fade out all nodes and links
      node.transition().style('opacity', 0.1);
      link.transition().style('opacity', 0.1);

      // Highlight connected nodes and links
      node.filter(node => areNodesConnected(d, node))
        .transition()
        .style('opacity', 1);

      link.filter(link => link.source === d || link.target === d)
        .transition()
        .style('opacity', 1);

      // Add a stroke to the selected node
      d3.select(this).attr('stroke', 'black').attr('stroke-width', 2);

      // Display text label with TV Show/Cast name
      svg.append('text')
        .attr('id', 'hover-label')
        .attr('x', d.x)
        .attr('y', d.y - 15)
        .text(d.name);

      // Remove connected node styling from other nodes
      node.filter(node => !areNodesConnected(d, node))
        .classed('connected-node', false);
    }

  });
});
